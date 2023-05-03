const express = require("express");
const { Posts, Users, Comments } = require("../models"); // Posts DB import
const { Op } = require("sequelize");
const authMiddleware = require("../middlewares/auth-middlewares");
const router = express.Router();
const { parseModelToFlatObject } = require('../helpers/sequelize.helper');

// 댓글 생성
router.post("/:postId/comments", authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const { comment } = req.body;

        const getExistPost = await Posts.findOne({ where: { postId } });

        if (!getExistPost) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        };

        const writeComments = await Comments.create({
            UserId: userId,
            PostId: postId,
            comment
        });

        return res.status(200).json({ comments: writeComments })

    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: "댓글 생성 에러" })
    }
});


// // 댓글 조회
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comments.findAll({
            attributes: ['commentId', 'comment', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: Users,
                    attributes: ['userId', 'nickname'],
                },
            ],
            where: { [Op.and]: [{ PostId: postId }] },
            order: [['createdAt', 'DESC']],
            raw: true,
        }).then((models) => models.map(parseModelToFlatObject));

        return res.status(200).json({ data: comments });
    } catch (error) {
        console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
        return res.status(400).json({
            errorMessage: '댓글 조회에 실패하였습니다.',
        });
    }
});


// 댓글 삭제
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { userId } = res.locals.user;

        const isExistComment = await Comments.findByPk(commentId);
        if (!isExistComment) {
            return res.status(404).json({
                errorMessage: '댓글이 존재하지 않습니다.',
            });
        }

        const deleteCount = await Comments.destroy({
            where: { commentId, PostId: postId, UserId: userId },
        });

        if (deleteCount < 1) {
            return res.status(400).json({
                errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.',
            });
        }

        return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
        return res.status(400).json({
            errorMessage: '댓글 삭제에 실패하였습니다.',
        });
    }
});



module.exports = router;