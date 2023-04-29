const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/auth-middlewares");
const { Posts } = require("../models");


// 게시글 생성 API // 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 작성 가능 기능 구현 못함
router.post("/posts", authMiddleware, async (req, res) => {
    try {
        const { userId, nickname } = res.locals.user;
        const { title, content } = req.body;

        await Posts.create({
            UserId: userId,
            title, content, nickname
        });


        // body 데이터가 정상적으로 전달되지 않은 경우
        if(!title && !content) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        

        // title의 형식이 비정상적인 경우
        if(title.length < 0) {
            return res.status(412).json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
        }

        // content의 형식이 비정상적인 경우
        if (content.length < 0) {
            return res.status(412).json({ errorMessage: "게시글 content의 형식이 일치하지 않습니다." });
        }


        return res.status(200).json({ message: "게시글 작성에 성공하였습니다." })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            errorMessage: "게시글 작성에 실패하였습니다."
        })
    }

});


// 게시글 조회
router.get("/posts", async (req, res) => {
    try {
        const posts = await Posts.findAll({
            attributes: ["postId", "userId", "nickname", "title", "createdAt", "updatedAt"],
            order: [['createdAt', 'DESC']],
        });
        return res.status(200).json({ posts: posts });
    } catch (err) {
        return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
    }
});



// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Posts.findOne({
            attributes: ["postId", "userId", "nickname", "title", "content", "createdAt", "updatedAt"],
            where: { postId }
        })

        return res.status(200).json({ posts: post });
    } catch (err) {
        return res.status(400).json({ errorMessage: "게시글 상세 조회에 실패하였습니다." });
    }
});


// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;
    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    } else if (post.UserId !== userId) {
        return res.status(401).json({ message: "권한이 없습니다." });
    }
    // 게시글의 권한을 확인하고, 게시글을 수정합니다.
    await Posts.update(
        { title, content }, // title과 content 컬럼을 수정합니다.
        {
            where: {
                [Op.and]: [{ postId }, { UserId: userId }],
            }
        }
    );
    return res.status(200).json({ data: "게시글이 수정되었습니다." });
});



// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    } else if (post.UserId !== userId) {
        return res.status(401).json({ message: "권한이 없습니다." });
    }
    // 게시글의 권한을 확인하고, 게시글을 삭제합니다.
    await Posts.destroy({
        where: {
            [Op.and]: [{ postId }, { UserId: userId }],
        }
    });
    return res.status(200).json({ data: "게시글이 삭제되었습니다." });
});

module.exports = router;