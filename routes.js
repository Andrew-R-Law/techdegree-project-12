'use strict';

const express = require('express');
const { restart } = require('nodemon');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');

const router = express.Router();

router.get('/users', authenticateUser, asyncHandler( async (req, res) => {
    const user = await User.findByPK(req.currentUser.id);

    if (user) {
        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddress,
            password: user.password
        });
    }
}));

router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201)
        .json({ "message": "Account created!"})
        .location('/')
        .end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
}));

router.delete('/users/:id', authenticateUser, asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
        User.destroy({where: {id: req.params.id }});
        res.status(201).json({message: "User deleted."}).end();
    } else {
        res.status(404).json({message: 'It looks like the user you are looking for does not exist.'});
    }
}));

router.get('/courses', asyncHandler( async (req, res) => {
    const courses = await Course.findAll({
        include: [{
            model: User,
            as: 'Enrolled'
        }]
    });
    res.status(200).json(courses);
}));

router.get('/courses/:id', asyncHandler( async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [{
            model: User,
            as: 'Enrolled'
        }]
    });

    if (course) {
        res.status(200).json({course});
    } else {
        res.status(401).json({message: 'It looks like the course you are looking for does not exist.'});
    }
}));

router.post('/courses', authenticateUser, asyncHandler( async (req, res) => {
    try {
        const course = await Course.create({
            title: req.body.title,
            description: req.body.description,
            userId: req.currentUser.id
        });
        res.status(201).location(`/courses/${course.id}`).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
        } else {
            throw error;
        }
    }
}));

router.put('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
    const course = await Course.findByPk(req.params.id);

    if (course) {
        try {
            Course.update({
                title: req.body.title,
                description: req.body.description,
                estimatedTime: req.body.estimatedTime,
                materialsNeeded: req.body.materialsNeeded
            }, { where: {id: req.params.id }});
            
            res.status(204)
            .json({message: "Course updated!"})
            .end();
        } catch (error) {
            if (error.name == 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstrainterror') {
                const errors = error.errors.map(err => err.message);
                res.status(400).json({errors});
            } else {
                throw error;
            }
        }
    } else {
        res.status(404).json({message: 'It looks like the course you are trying to update does not exist.'});
    }
}));

router.delete('/courses/:id', authenticateUser, asyncHandler( async (req, res) => {
    const course = await Course.findOne({id: req.params.id});

    if (course) {
        Course.destroy({ where: {id: req.params.id}});
        res.status(204).json({message: "Course deleted."}).end();
    } else {
        res.status(404).json({message: 'It looks like the course you are trying to delete does not exist.'});
    }
}));

module.exports = router;