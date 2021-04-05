const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config')
const { check, validationResult } = require('express-validator');
const User = require("../models/User") 
const router = express.Router();

const auth = require('../middleware/auth');
// @route    POST    api/auth
// @desc     GET logged in  user
// @access   private

router.get('/',auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({user})
    } catch (error) {
        console.log(err.message);
        res.status(500).send('Server Error');
        
    }
})





// @route    POST    api/auth
// @desc     Auth user & get token 
// @access   private
router.post('/', [
    check('email',' please include a vlaid email').isEmail(),
    check('password', 'enter a  password').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const { email, password} = req.body

    try {
        let user = await User.findOne({ email }); 

        if(!user) {
            return res.status(400).json({msg: 'invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({msg: 'invalid credentials'});
        }

         // create payload to send token 
         const payload  = {
             user: {
                 id:user.id
             }
         }

         jwt.sign(payload,config.get('jwtSecret'), {
            expiresIn: 3600 
         }, (err, token) => {
             if(err) throw err;
             res.json({ token })
         });

    } catch (error) {

        console.log(err.message);
        res.status(500).send('Server Error ')
        
        
    }
})


module.exports = router;