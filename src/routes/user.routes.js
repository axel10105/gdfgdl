const { authJwt } = require('../middlewares');
const controller = require('../controllers/user.controllers');

module.exports=(app)=>{
    app.use((req,res,next)=>{
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/api/test/all', controller.allAccess);
    app.get('/api/test/user',[authJwt.verifyToken],controller.onlyUser);
    app.get('/api/test/moderator',[authJwt.verifyToken, authJwt.isModerator],controller.onlyModerator);
    app.get('/api/test/admin',[authJwt.verifyToken, authJwt.isAdmin],controller.onlyAdmin);
    app.get('/api/test/modify',[authJwt.verifyToken,authJwt.isAdmin],controller.modifyrole)
}