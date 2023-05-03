const express = require("express");
const cookieParser = require("cookie-parser");

// const usersRouter = require("./routes/users.route.js")
// const postsRouter = require("./routes/posts.route.js");
const app = express();
const PORT = 3020;

// const swaggerUi = require("swagger-ui-express");
// const swaggerFile = require("./swagger-output");
const routes = require('./routes'); // 한 번에 임포트

app.use(express.json());
app.use(cookieParser());
// app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
// app.use('/', [usersRouter, postsRouter]);
app.use('/', routes);



app.listen(PORT, () => {
  console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
})