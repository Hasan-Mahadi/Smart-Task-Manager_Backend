import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Project Manager',
      email: 'manager@example.com',
      password,
      role: 'PROJECT_MANAGER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      name: 'Team Member',
      email: 'member@example.com',
      password,
      role: 'TEAM_MEMBER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@example.com' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'member2@example.com',
      password,
      role: 'TEAM_MEMBER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern UI/UX',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdById: manager.id,
      members: {
        create: [
          { userId: manager.id },
          { userId: member.id },
          { userId: member2.id },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build cross-platform mobile application for iOS and Android',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      createdById: manager.id,
      members: {
        create: [{ userId: manager.id }, { userId: member.id }],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'API Migration',
      description: 'Migrate legacy REST API to GraphQL',
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      createdById: admin.id,
      members: {
        create: [{ userId: admin.id }, { userId: manager.id }],
      },
    },
  });

  const tasks = [
    {
      title: 'Design Homepage Mockup',
      description: 'Create wireframes and high-fidelity mockups for the homepage',
      projectId: project1.id,
      assignedToId: member.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      createdById: manager.id,
    },
    {
      title: 'Implement Authentication',
      description: 'Set up JWT auth with refresh tokens',
      projectId: project1.id,
      assignedToId: member2.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priority: 'HIGH' as const,
      status: 'TODO' as const,
      createdById: manager.id,
    },
    {
      title: 'Write Unit Tests',
      description: 'Achieve 80% code coverage for core modules',
      projectId: project1.id,
      assignedToId: member.id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      priority: 'MEDIUM' as const,
      status: 'TODO' as const,
      createdById: manager.id,
    },
    {
      title: 'Setup CI/CD Pipeline',
      description: 'Configure GitHub Actions for automated deployments',
      projectId: project2.id,
      assignedToId: member.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      createdById: manager.id,
    },
    {
      title: 'Database Schema Design',
      description: 'Design and implement Prisma schema',
      projectId: project2.id,
      assignedToId: member2.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: 'MEDIUM' as const,
      status: 'COMPLETED' as const,
      createdById: manager.id,
    },
    {
      title: 'API Documentation',
      description: 'Generate Swagger docs for all endpoints',
      projectId: project3.id,
      assignedToId: manager.id,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      priority: 'LOW' as const,
      status: 'COMPLETED' as const,
      createdById: admin.id,
    },
  ];

  for (const task of tasks) {
    const created = await prisma.task.create({ data: task });

    await prisma.activityLog.create({
      data: {
        action: 'Task Created',
        userId: task.createdById,
        projectId: task.projectId,
        taskId: created.id,
      },
    });

    if (task.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          title: 'Task Assignment',
          message: `You have been assigned to task "${task.title}"`,
        },
      });
    }
  }

  await prisma.activityLog.createMany({
    data: [
      { action: 'Project Created', userId: manager.id, projectId: project1.id },
      { action: 'Project Created', userId: manager.id, projectId: project2.id },
      { action: 'Project Created', userId: admin.id, projectId: project3.id },
      { action: 'Member Added', userId: manager.id, projectId: project1.id },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: member.id,
        title: 'Project Invitation',
        message: 'You have been added to project "Website Redesign"',
      },
      {
        userId: member.id,
        title: 'Deadline Reminder',
        message: 'Task "Design Homepage Mockup" is due in 7 days',
        isRead: false,
      },
    ],
  });

  await prisma.comment.create({
    data: {
      taskId: (await prisma.task.findFirst({
        where: { title: 'Design Homepage Mockup' },
      }))!.id,
      userId: member.id,
      content: 'Started working on the wireframes. Will share draft by EOD.',
    },
  });

  console.log('Seed completed successfully!');
  console.log('Demo credentials:');
  console.log('  Admin: admin@example.com / password123');
  console.log('  Manager: manager@example.com / password123');
  console.log('  Member: member@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
