'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName : {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide your first name.'
                },
                notEmpty: {
                    msg: 'Please provide your first name.'
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide your last name.'
                },
                notEmpty: {
                    msg: 'Please provide your last name.'
                }
            }
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'The email you entered already exists in our database.'
            },
            validate: {
                notNull: {
                    msg: 'Please provide an email address.'
                },
                notEmpty: {
                    msg: 'Please provide an email address.'
                },
                isEmail: {
                    args: true,
                    msg: 'Make sure your email address is valid.'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please enter a password.'
                },
                notEmpty: {
                    msg: 'Please enter a password. '
                },
                len: {
                    args: [8, 20],
                    msg: 'Your password must be between 8 and 20 characters long.'
                },

                set(val) {
                    if(val === this.password) {
                        const hashedPassword = bcrypt.hashSync(this.password, salt);
                        this.setDataValue('password', hashedPassword);
                    }
                }
            }
        }  
    }, { sequelize} );

    User.associate = (models) => {
        User.hasMany(models.Course, {
            as: 'Enrolled',
            foreignKey: {
                fieldName: 'userId'
            }
        });
    };

    return User;
};