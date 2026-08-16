const express = require("express");

const {
    create,
    list,
    getById,
} = require("../controllers/conversation.controller");

const router = express.Router();

router.post("/", create);
router.get("/", list);
router.get("/:id", getById);

module.exports = router;