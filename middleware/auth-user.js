'use strict';

const auth = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.authenticateUser = async (req, res, next) => {
    let message;

    const credentials = auth(req);

    if (credentials) {
        const user = await User.findOne( {where: {
            firstName: credentials.firstName,
            lastName: credentials.lastName
        }} );
        if (user) {
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.confirmedPassword);
            if(authenticated) {
                console.log('Authentication successful!');
                req.currentUser = user;
            } else {
                message = 'Authentication failed.';
            }
        } else {
            message = 'User information not found.';
        }
    } else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied'});
    } else {
        next();
    }
};