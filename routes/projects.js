const express = require("express");
const router = express.Router();

const project_controller = require("../controllers/projectController");

router.get("/", project_controller.project_list);

router.post("/", project_controller.project_create);

router.get("/:ProjectId", project_controller.project_detail);

router.get("/jobs/:JobIdList", project_controller.project_job_list);

router.get("/job/:JobId", project_controller.project_job);

router.patch("/:ProjectId", project_controller.project_patch);

router.delete("/:ProjectId", project_controller.project_delete);

router.post("/update/:ProjectName", project_controller.project_update);

router.post("/run", project_controller.project_run);

router.post("/generate", project_controller.project_generate);

module.exports = router;
