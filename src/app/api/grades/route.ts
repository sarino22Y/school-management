import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const gradeSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  periodId: z.string(),
  value: z.number().min(0).max(20),
  evaluationType: z.string().optional()
})

// ============================================
// POST - Créer une note
// ============================================

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = gradeSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() }, 
        { status: 400 }
      )
    }

    const { studentId, subjectId, periodId, value, evaluationType } = parsed.data

    // Vérifier la période
    const period = await prisma.period.findUnique({
      where: { id: periodId }
    })

    if (!period) {
      return NextResponse.json({ error: "Période non trouvée" }, { status: 404 })
    }

    // Vérifier verrouillage période
    if (period.status === "CLOSED" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Période clôturée - Contactez l'administrateur" }, 
        { status: 403 }
      )
    }

    // Vérifier permissions enseignant
    let teacherAssignmentId: string | null = null
    
    if (session.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacher) {
        return NextResponse.json(
          { error: "Profil enseignant non trouvé" }, 
          { status: 403 }
        )
      }

      const assignment = await prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          subjectId,
          schoolYearId: period.schoolYearId
        }
      })

      if (!assignment) {
        return NextResponse.json(
          { error: "Vous n'êtes pas affecté à cette matière" }, 
          { status: 403 }
        )
      }

      teacherAssignmentId = assignment.id
    } else {
      // Admin - récupérer une affectation valide
      const assignment = await prisma.teacherAssignment.findFirst({
        where: { subjectId, schoolYearId: period.schoolYearId }
      })
      teacherAssignmentId = assignment?.id || ""
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 })
    }

    // Création avec audit
    const result = await prisma.$transaction(async (tx) => {
      const grade = await tx.grade.create({
        data: {
          studentId,
          classId: student.classId,
          subjectId,
          teacherAssignmentId: teacherAssignmentId || "",
          periodId,
          schoolYearId: period.schoolYearId,
          value,
          evaluationType,
          createdById: session.user.id,
          updatedById: session.user.id
        }
      })

      await tx.auditLog.create({
        data: {
          action: "GRADE_CREATE",
          entityType: "Grade",
          entityId: grade.id,
          newValue: grade as any,
          userId: session.user.id,
          periodId
        }
      })

      return grade
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error("Erreur création note:", error)
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    )
  }
}

// ============================================
// GET - Liste des notes
// ============================================

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const periodId = searchParams.get("periodId")
    const studentId = searchParams.get("studentId")

    const where: any = {}
    
    if (classId) where.classId = classId
    if (periodId) where.periodId = periodId
    if (studentId) where.studentId = studentId

    // Filtres selon le rôle
    if (session.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
      })
      
      if (!teacher) {
        return NextResponse.json(
          { error: "Profil enseignant non trouvé" }, 
          { status: 403 }
        )
      }
      
      const assignments = await prisma.teacherAssignment.findMany({
        where: { teacherId: teacher.id },
        select: { subjectId: true, classId: true }
      })

      if (assignments.length === 0) {
        return NextResponse.json([]) // Aucune affectation = aucune note
      }

      where.OR = assignments.map(a => ({
        subjectId: a.subjectId,
        classId: a.classId
      }))
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true,
            internalId: true
          } 
        },
        subject: { 
          select: { 
            id: true,
            name: true, 
            coefficient: true 
          } 
        },
        period: { 
          select: { 
            id: true,
            label: true, 
            status: true 
          } 
        }
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { subject: { name: 'asc' } }
      ]
    })

    return NextResponse.json(grades)

  } catch (error) {
    console.error("Erreur récupération notes:", error)
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    )
  }
}