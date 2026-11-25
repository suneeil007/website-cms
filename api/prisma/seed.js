
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || "admin@cms.local";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "Admin@123456";

const permissions = [
    // Dashboard
    { name: "View Dashboard", slug: "dashboard.view", module: "Dashboard" },

    // Pages
    { name: "View Pages", slug: "pages.view", module: "Pages" },
    { name: "Create Pages", slug: "pages.create", module: "Pages" },
    { name: "Edit Pages", slug: "pages.edit", module: "Pages" },
    { name: "Delete Pages", slug: "pages.delete", module: "Pages" },
    { name: "Publish Pages", slug: "pages.publish", module: "Pages" },

    // Media
    { name: "View Media", slug: "media.view", module: "Media" },
    { name: "Upload Media", slug: "media.upload", module: "Media" },
    { name: "Edit Media", slug: "media.edit", module: "Media" },
    { name: "Delete Media", slug: "media.delete", module: "Media" },

    // Users
    { name: "View Users", slug: "users.view", module: "Users" },
    { name: "Create Users", slug: "users.create", module: "Users" },
    { name: "Edit Users", slug: "users.edit", module: "Users" },
    { name: "Delete Users", slug: "users.delete", module: "Users" },
    { name: "Manage Users", slug: "users.manage", module: "Users" },

    // Roles
    { name: "View Roles", slug: "roles.view", module: "Roles" },
    { name: "Create Roles", slug: "roles.create", module: "Roles" },
    { name: "Edit Roles", slug: "roles.edit", module: "Roles" },
    { name: "Delete Roles", slug: "roles.delete", module: "Roles" },
    { name: "Manage Roles", slug: "roles.manage", module: "Roles" },

    // Permissions
    {
        name: "View Permissions",
        slug: "permissions.view",
        module: "Permissions",
    },
    {
        name: "Manage Permissions",
        slug: "permissions.manage",
        module: "Permissions",
    },
];

async function main() {
    console.log("Starting CMS database seeding...");

    if (ADMIN_PASSWORD.length < 12) {
        throw new Error("Admin password must contain at least 12 characters.");
    }

    // 1. Create or update Super Admin role.
    const role = await prisma.role.upsert({
        where: {
            slug: "super-admin",
        },
        update: {
            name: "Super Admin",
            description: "Full access to all CMS modules and features.",
            isSystem: true,
        },
        create: {
            name: "Super Admin",
            slug: "super-admin",
            description: "Full access to all CMS modules and features.",
            isSystem: true,
        },
    });

    console.log("Super Admin role ready.");

    // 2. Create or update permissions.
    const createdPermissions = [];

    for (const permission of permissions) {
        const result = await prisma.permission.upsert({
            where: {
                slug: permission.slug,
            },
            update: {
                name: permission.name,
                module: permission.module,
            },
            create: permission,
        });

        createdPermissions.push(result);
    }

    console.log(`${createdPermissions.length} permissions ready.`);

    // 3. Assign all permissions to Super Admin.
    await prisma.rolePermission.createMany({
        data: createdPermissions.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
        })),
        skipDuplicates: true,
    });

    console.log("Permissions assigned to Super Admin.");

    // 4. Hash initial administrator password.
    const passwordHash = await argon2.hash(ADMIN_PASSWORD, {
        type: argon2.argon2id,
    });

    // 5. Create or update initial administrator.
    const user = await prisma.user.upsert({
        where: {
            email: ADMIN_EMAIL,
        },
        update: {
            firstName: "Super",
            lastName: "Administrator",
            status: "ACTIVE",
        },
        create: {
            firstName: "Super",
            lastName: "Administrator",
            email: ADMIN_EMAIL,
            passwordHash,
            status: "ACTIVE",
            roles: {
                create: {
                    roleId: role.id,
                },
            },
        },
    });

    // 6. Ensure user has Super Admin role.
    await prisma.userRole.createMany({
        data: [
            {
                userId: user.id,
                roleId: role.id,
            },
        ],
        skipDuplicates: true,
    });

    console.log("Super Admin user ready.");

    console.log("-----------------------------------");
    console.log("CMS SEED COMPLETED SUCCESSFULLY");
    console.log("-----------------------------------");
    console.log(`Admin Email: ${user.email}`);
    console.log(`Admin UUID: ${user.uuid}`);
    console.log(`Role: ${role.name}`);
    console.log(`Permissions: ${createdPermissions.length}`);
    console.log("-----------------------------------");
    console.log("Password is not displayed for security.");
}

main()
    .catch((error) => {
        console.error("Database seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
