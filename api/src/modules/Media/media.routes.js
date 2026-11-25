
import { Router } from "express";

import * as controller from "./media.controller.js";

import {
    uploadMedia,
} from "./media.upload.js";

const router = Router();

// ==========================================
// UPLOAD
// ==========================================

router.post(
    "/upload",
    uploadMedia,
    controller.upload
);

// ==========================================
// MEDIA LIBRARY
// ==========================================

router.get(
    "/",
    controller.index
);

// ==========================================
// MEDIA DETAILS
// ==========================================

router.get(
    "/:uuid",
    controller.show
);

// ==========================================
// DOWNLOAD / PREVIEW
// ==========================================

router.get(
    "/:uuid/download",
    controller.download
);

// ==========================================
// UPDATE METADATA
// ==========================================

router.put(
    "/:uuid",
    controller.update
);

// ==========================================
// ATTACH MEDIA TO PAGE
// ==========================================

router.post(
    "/:uuid/attach",
    controller.attach
);

// ==========================================
// DETACH MEDIA FROM PAGE
// ==========================================

router.delete(
    "/:uuid/detach",
    controller.detach
);

// ==========================================
// DELETE MEDIA PERMANENTLY
// ==========================================

router.delete(
    "/:uuid",
    controller.destroy
);

export default router;
