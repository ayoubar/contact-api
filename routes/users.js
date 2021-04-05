const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config')
const { check, validationResult } = require('express-validator');
const wishlist = require('../middleware/wishlist');
const router = express.Router();



const User = require("../models/User") 




// @route    POST    api/users
// @desc     Register a user
// @access   Public 
router.post('/',[
    check('name', 'Please add Name')
        .not()
        .isEmpty(),
    check('email','please include a valid email')
        .isEmail(),
    check('password','please enter a password with 6 or more characters')
        .isLength({ min: 6})
],
async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const { name , email , password }  = req.body;
    try {
        let user = await User.findOne({email})
        if(user) {
            
            res.status(400).json({ msg: 'User Already exists'})
        }
        user = new User({
            name,
            email,
            password
        });
        const salt  = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password , salt) 
        await user.save()
        const payload = {
            user: {
                id:user.id
            }
        }

        jwt.sign(payload,config.get('jwtSecret'), { 
            expiresIn: 3600
        }, (err, token) => {
            if(err) throw err;
            res.json({token})
        })
    }catch(err) {
        console.log(err.message);
        res.status(500).send('Server Error');
        
    }
})



module.exports = router;