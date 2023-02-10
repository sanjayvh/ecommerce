const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Role = require("../model/role");
const { Op } = require("sequelize");
const Cart = require("../model/cart");

exports.signup = (req, res, next) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors = errors.array();
    if (errors[0].param == "email") {
      return res.status(400).json({
        message: "Invalid email",
      });
    } else if (errors[0].param == "password") {
      return res.status(400).json({
        message: "Password length should be 5 to 20 characters",
      });
    }
  }

  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      const error = new Error("Email already exists");
      error.statusCode = 403;
      next(error);
    } else {
      bcrypt.hash(req.body.password, 12).then((hashedPassword) => {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          Cart.create().then((cart) => {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: hashedPassword,
            }).then((user) => {
              user.setRoles(roles);
              user.setCart(cart);
              res.status(201).json({
                message: "Sign Up Successful",
              });
            });
          });
        });
      });
    }
  });
};

// exports.signup = async (req, res, next) => {
//     let errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         errors = errors.array();
//         if (errors[0].param == "email") {
//             return res.status(400).json({
//                 message: "Invalid email",
//             });
//         } else if (errors[0].param == "password") {
//             return res.status(400).json({
//                 message: "Password length should be 5 to 20 characters",
//             });
//         }
//     }

//     const user = await User.findOne({
//         where: {
//             email: req.body.email,
//         },
//     });

//     if (user) {
//         const error = new Error("Email already exists");
//         error.statusCode = 403;
//         next(error);
//     } else {
//         const hashedPassword = await bcrypt.hash(req.body.password, 12);
//         const roles = await Role.findAll({
//             where: {
//                 name: {
//                     [Op.or]: req.body.roles,
//                 },
//             },
//         });

//         console.log("Roles:");
//         for (const role of roles) {
//           console.log("id:", role.dataValues.id, "|", "name:", role.dataValues.name);
//         }
        
//         const cart = await Cart.create();
//         const user = await User.create({
//           name: req.body.name,
//           email: req.body.email,
//           password: hashedPassword,
//         });
        
//         user.setRoles(roles);
//         user.setCart(cart);

//         console.log("Cart:", cart.dataValues);
//         console.log("User:", user.dataValues);

//         res.status(201).json({
//             message: "Sign Up Successful",
//         });
//     }
// };

exports.login = (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.email,
        },
    }).then((user) => {
        if (!user) {
            const error = new Error("Email not found");
            error.statusCode = 404;
            return next(error);
        } else {
            bcrypt.compare(req.body.password, user.password).then((isMatch) => {
                if (isMatch) {
                    const token = jwt.sign(
                        {
                            email: user.name,
                            userId: user.id,
                        },
                        "secretKey",
                        {
                            expiresIn: "2d",
                        }
                    );
                    res.status(200).json({
                        message: "Login Successful",
                        token,
                    });
                } else {
                    const error = new Error("Invalid Password");
                    error.statusCode = 403;
                    return next(error);
                }
            });
        }
    });
};
