const express = require('express')
const auth = require('./../middleware/auth')
const { check, validationResult } = require('express-validator');

const router = express.Router();

const User = require("../models/User") 
const Contact = require("../models/Contact") 

// @route    GET    api/contacts
// @desc     GET all users contacts
// @access   private
router.get('/', auth , async (req, res) => {
    try {
        const contacts = await Contact.find({user: req.user.id}).sort({data: -1}).select('-__v');
        res.json(contacts);
    } catch (error) {
        console.log(error.message);
        res.status(500).json('Server Error');
    }
})

// @route    POST    api/auth
// @desc     Add new contact
// @access   private
router.post('/', [auth, [
    check('name', 'please include name'),
    check('phone', 'please include phone'),
 
]], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const { name, email, phone , type } = req.body;
    try {
        const new_contact = new Contact({
            name,
            email,
            phone,
            type,
            user:req.user.id
        })

        const contact = await new_contact.save()
        res.json(contact);
    } catch (error) {
        console.log(error.message);
        res.status(500).json("Server Error");
        
    }
})

// @route    PUT    api/contact/:id
// @desc     Update Contact
// @access   private
router.put('/:id', auth, async  (req, res) => {
    const { name, email, phone , type } = req.body;


    // Build contact object 
    const contactFields ={}
        if(name) contactFields.name = name;
        if(email) contactFields.email = email;
        if(phone) contactFields.phone = phone;
        if(type) contactFields.type = type;

        try {
            let contact = await Contact.findById(req.params.id);
            if(!contact) return res.status(404).json({msg:'contact not found'});
            // Make sure user owns contact
            if(contact.user.toString() !== req.user.id ) {
                return res.status(401).json({msg: 'Not Authorized'});

            }

            contact = await Contact.findByIdAndUpdate(req.params.id, 
                { $set: contactFields},
                { new: true });

        res.json(contact);

        } catch (error) {
            console.log(error.message);
            res.status(500).json("Server Error");

        }
    
})

// @route    DELETE    api/contact/:id
// @desc     Update Contact
// @access   private
router.delete('/:id', auth, async  (req, res) => {
    // const { name, email, phone , type } = req.body;

        try {
            let contact = await Contact.findById(req.params.id);
            if(!contact) return res.status(404).json({msg:'contact not found'});
            // Make sure user owns contact
            if(contact.user.toString() !== req.user.id ) {
                return res.status(401).json({msg: 'Not Authorized'});

            }

           await Contact.findByIdAndRemove(req.params.id);
        res.json({msg: "contact removed"});

        } catch (error) {
            console.log(error.message);
            res.status(500).json("Server Error");

        }
    
})



module.exports = router;