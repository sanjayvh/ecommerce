const Role = require('../model/role');

exports.getAllRoles = async (req, res, next) => {
    const roles = await Role.findAll();

    var allRoles = [];

    for (const role of roles) {
        allRoles.push(role.dataValues.name);
    }

    res.status(200).json({
        roles: allRoles
    });
};

exports.postRoles = async (req, res, next) => {
    const role = await Role.create({
        name: req.body.role
    });

    res.status(200).json({
        message: "Role created successfully",
        role: role.dataValues.name
    });
};

exports.deleteRoles = async (req, res, next) => {
    const role = await Role.destroy({
        where: {
            name: req.body.role
        }
    });

    res.status(200).json({
        message: "Role deleted successfully"
    });
};