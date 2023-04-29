const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { Users } = require("../models");
const { isRegexMatch } = require('../helpers/regex.helper');


// 회원가입 API
router.post("/signup", async (req, res) => {
    try {
        const { nickname, password, confirm } = req.body;
        const isExistUser = await Users.findOne({
            where: {
                nickname: nickname,
            }
        });

        // nickname과 동일한 유저가 실제로 존재할 때 에러를 발생 시킴
        if (isExistUser) {
            return res.status(412).json({
                errormessage: "중복된 닉네임입니다."
            });
        }

        // password가 닉네임에 포함되어 있을 때
        if (isRegexMatch(password, nickname)) {
            return res.status(412).send({
                errorMessage: '패스워드에 닉네임이 포함되어 있습니다.',
            });
        }

        // 비밀번호가 일치하지 않을 때
        if (password !== confirm) {
            return res.status(412).send({
                errorMessage: '패스워드가 일치하지 않습니다.',
            });
        }

        // 비밀번호의 길이가 4보다 작을 때
        if (password.length < 4) {
            return res.status(412).send({
                errorMessage: "패스워드 형식이 일치하지 않습니다."
            })
        }

        // 닉네임의 형식이 일치하지 않을 때 / 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성하기
        if ((!/^[a-zA-Z0-9]+$/.test(nickname)) || (nickname.length < 4)) {
            res.status(412).json({
                errorMessage: "닉네임의 형식이 일치하지 않습니다."
            });
            return;
        };


        await Users.create({ nickname, password });


        return res.status(201).json({ message: "회원가입이 완료되었습니다." });
    } catch (error) {
        return res.status(400).json({
            errormessage: "요청한 데이터 형식이 올바르지 않습니다."
        });
    }
});


// 로그인 API
router.post("/login", async (req, res) => {
    try {
        const { nickname, password } = req.body;
        const user = await Users.findOne({
            where: { nickname }
        });

        // 사용자의 존재
        if (!user) {
            return res.status(412).json({
                errorMessage: "닉네임 또는 패스워드를 확인해주세요."
            });
        }

        // 비밀번호가 일치하지 않음
        if (user.password !== password) {
            return res.status(412).json({
                errorMessage: "비밀번호가 일치하지 않습니다."
            });
        }


        // jwt를 생성하고
        const token = jwt.sign({
            userId: user.userId
        }, "customized_secret_key");

        // 쿠키를 할당
        res.cookie("authorization", `Bearer ${token}`);
        // response할당\
        return res.status(200).json({ token: token });

    } catch (error) {
        res.status(400).json({
            errorMessage: "로그인에 실패하였습니다."
        });
    }
});


module.exports = router;