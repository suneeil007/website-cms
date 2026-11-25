
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const MODULES_DIR = path.join(ROOT, "src", "modules");

function toPascalCase(value) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
        )
        .join("");
}

function toCamelCase(value) {
    const name = toPascalCase(value);
    return name.charAt(0).toLowerCase() + name.slice(1);
}

function toKebabCase(value) {
    return toPascalCase(value)
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
}

function writeFile(moduleDirectory, fileName, content, created) {
    const filePath = path.join(moduleDirectory, fileName);

    if (fs.existsSync(filePath)) {
        throw new Error(
            `Unexpected existing file: ${path.relative(ROOT, filePath)}`
        );
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
    created.push(fileName);

    console.log(`  CREATED  ${fileName}`);
}

function buildFiles(name) {
    const pascal = toPascalCase(name);
    const camel = toCamelCase(name);
    const kebab = toKebabCase(name);

    return {
        [`${camel}.routes.js`]: `import { Router } from "express";
import * as controller from "./${camel}.controller.js";

const router = Router();

router.get("/", controller.index);
router.get("/:uuid", controller.show);
router.post("/", controller.store);
router.put("/:uuid", controller.update);
router.delete("/:uuid", controller.destroy);

export default router;
`,

        [`${camel}.controller.js`]: `import * as service from "./${camel}.service.js";

export async function index(req, res, next) {
    try {
        const data = await service.getAll(req.query);

        res.json({
            success: true,
            message: "${pascal} list retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function show(req, res, next) {
    try {
        const data = await service.getByUuid(req.params.uuid);

        res.json({
            success: true,
            message: "${pascal} retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function store(req, res, next) {
    try {
        const data = await service.create(req.body);

        res.status(201).json({
            success: true,
            message: "${pascal} created successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const data = await service.update(
            req.params.uuid,
            req.body
        );

        res.json({
            success: true,
            message: "${pascal} updated successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        await service.remove(req.params.uuid);

        res.json({
            success: true,
            message: "${pascal} deleted successfully.",
            data: null,
        });
    } catch (error) {
        next(error);
    }
}
`,

        [`${camel}.service.js`]: `import * as repository from "./${camel}.repository.js";
import {
    create${pascal}Schema,
    update${pascal}Schema,
} from "./${camel}.validation.js";

export async function getAll(query = {}) {
    const page = Math.max(
        1,
        Number.parseInt(query.page, 10) || 1
    );

    const perPage = Math.min(
        100,
        Math.max(1, Number.parseInt(query.per_page, 10) || 15)
    );

    const result = await repository.findAll({ page, perPage });

    return {
        items: result.items,
        pagination: {
            page,
            per_page: perPage,
            total: result.total,
            last_page: Math.max(
                1,
                Math.ceil(result.total / perPage)
            ),
        },
    };
}

export async function getByUuid(uuid) {
    const record = await repository.findByUuid(uuid);

    if (!record) {
        const error = new Error("${pascal} not found.");
        error.statusCode = 404;
        throw error;
    }

    return record;
}

export async function create(payload) {
    const data = create${pascal}Schema.parse(payload);
    return repository.create(data);
}

export async function update(uuid, payload) {
    await getByUuid(uuid);

    const data = update${pascal}Schema.parse(payload);
    return repository.update(uuid, data);
}

export async function remove(uuid) {
    await getByUuid(uuid);
    return repository.remove(uuid);
}
`,

        [`${camel}.repository.js`]: `import prisma from "../../core/database/prisma.js";

function getModel() {
    const model = prisma.${camel};

    if (!model) {
        throw new Error(
            'Prisma model "${pascal}" is not configured. ' +
            'Add it to prisma/schema.prisma and regenerate Prisma Client.'
        );
    }

    return model;
}

export async function findAll({ page, perPage }) {
    const model = getModel();

    const [items, total] = await prisma.$transaction([
        model.findMany({
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: { createdAt: "desc" },
        }),
        model.count(),
    ]);

    return { items, total };
}

export function findByUuid(uuid) {
    return getModel().findUnique({ where: { uuid } });
}

export function create(data) {
    return getModel().create({ data });
}

export function update(uuid, data) {
    return getModel().update({
        where: { uuid },
        data,
    });
}

export function remove(uuid) {
    return getModel().delete({ where: { uuid } });
}
`,

        [`${camel}.validation.js`]: `import { z } from "zod";

// TODO: Define the actual fields before enabling create/update requests.
// Empty schemas are placeholders and must not be used as production validation.

export const create${pascal}Schema = z.object({
    // Example: title: z.string().trim().min(1).max(200),
});

export const update${pascal}Schema =
    create${pascal}Schema.partial();
`,

        [`${camel}.constants.js`]: `export const ${pascal.toUpperCase()}_DEFAULTS = Object.freeze({
    PER_PAGE: 15,
    MAX_PER_PAGE: 100,
});
`,

        "index.js": `export { default as ${pascal}Routes } from "./${camel}.routes.js";
`,

        "README.md": `# ${pascal} Module

API prefix: \`/api/v1/${kebab}\`

## Files

- \`${camel}.routes.js\`: Express endpoints
- \`${camel}.controller.js\`: HTTP handling
- \`${camel}.service.js\`: Business logic
- \`${camel}.repository.js\`: Prisma database access
- \`${camel}.validation.js\`: Zod validation
- \`${camel}.constants.js\`: Module constants

## Setup required

1. Add the \`${pascal}\` model to \`prisma/schema.prisma\`.
2. Include a unique \`uuid\` field and a \`createdAt\` field.
3. Add real Zod validation fields in \`${camel}.validation.js\`.
4. Run a Prisma migration and regenerate Prisma Client.

The module routes are discovered automatically by the central API router.
Do not expose these CRUD endpoints publicly until authentication,
authorization, and field validation are configured.
`,

        "tests/module.test.js": `import test from "node:test";
import assert from "node:assert/strict";

test("${pascal} module starter", () => {
    assert.equal("${pascal}", "${pascal}");
});
`,
    };
}

function main() {
    const input = process.argv[2];

    if (!input || !/^[a-zA-Z][a-zA-Z0-9 _-]*$/.test(input)) {
        console.error(
            "Usage: npm run module:make -- <ModuleName>"
        );
        process.exitCode = 1;
        return;
    }

    const pascal = toPascalCase(input);

    if (!pascal) {
        console.error("Invalid module name.");
        process.exitCode = 1;
        return;
    }

    const moduleDirectory = path.resolve(MODULES_DIR, pascal);

    if (!moduleDirectory.startsWith(MODULES_DIR + path.sep)) {
        console.error("Invalid module path.");
        process.exitCode = 1;
        return;
    }

    if (fs.existsSync(moduleDirectory)) {
        console.error(
            `Module [${pascal}] already exists. No files were changed.`
        );
        process.exitCode = 1;
        return;
    }

    const files = buildFiles(pascal);
    const created = [];

    try {
        fs.mkdirSync(moduleDirectory, { recursive: true });

        for (const [fileName, content] of Object.entries(files)) {
            writeFile(moduleDirectory, fileName, content, created);
        }

        console.log("");
        console.log(`Module [${pascal}] created successfully.`);
        console.log(`Directory: src/modules/${pascal}`);
        console.log(`Files created: ${created.length}`);
        console.log(`Route prefix: /api/v1/${toKebabCase(pascal)}`);
    } catch (error) {
        console.error(`Module generation failed: ${error.message}`);
        console.error(
            "Inspect the module directory before trying again; existing files are never overwritten."
        );
        process.exitCode = 1;
    }
}

main();
