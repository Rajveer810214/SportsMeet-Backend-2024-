const express = require('express');
const ldap = require('ldapjs');
const jwt = require('jsonwebtoken');
const studentInfo = require('../../models/Student'); // Assuming this is your student schema
require('dotenv').config();

const router = express.Router();

const JWT_Token = process.env.JWT_TOKEN;

// Helper function for LDAP authentication and search
const authenticateAndSearch = async (username, password) => {
    const client = ldap.createClient({
        url: process.env.LDAP_URL,
    });

    const baseDn = process.env.LDAP_BASE_DN;  // Base DN from .env

    return new Promise((resolve, reject) => {
        const userDn = `uid=${username},${process.env.LDAP_PEOPLE_OU},${baseDn}`;  // Construct user DN

        // Bind using the provided user's credentials
        client.bind(userDn, password, (err) => {
            if (err) {
                console.error('LDAP bind error:', err);
                reject(new Error('Invalid credentials: Wrong username or password.'));
                client.unbind();
                return;
            }

            console.log('Authentication successful for user:', username);

            // Perform an LDAP search for additional user details
            const searchOptions = {
                filter: `(uid=${username})`,  // Search for user by uid
                scope: 'sub',                 // Search all subtrees
                attributes: ['*'],            // Fetch all attributes
            };

            client.search(baseDn, searchOptions, (searchErr, res) => {
                if (searchErr) {
                    reject(new Error('Search error: ' + searchErr.message));
                    client.unbind();
                    return;
                }

                let userInfo = null;

                res.on('searchEntry', (entry) => {
                    console.log('Search entry found:');
                    userInfo = entry.attributes.reduce((info, attribute) => {
                        info[attribute.type] = attribute.values.length > 1 ? attribute.values : attribute.values[0];
                        return info;
                    }, {});
                });

                res.on('end', (result) => {
                    if (result.status !== 0) {
                        reject(new Error('Search ended with error status: ' + result.status));
                    } else if (userInfo) {
                        resolve(userInfo);
                    } else {
                        reject(new Error('User information not found.'));
                    }
                    client.unbind();
                });

                res.on('error', (err) => {
                    reject(new Error('Search error: ' + err.message));
                    client.unbind();
                });
            });
        });
    });
};

// Route to authenticate, search user, and generate JWT token
router.post('/authenticate', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Authenticate with LDAP and fetch user info
        const userInfo = await authenticateAndSearch(username, password);

        // Check if the user exists in the database (assuming `email` or `username` is used)
        const student = await studentInfo.findOne({ email: userInfo.mail });  // Assuming LDAP returns an email attribute

        if (!student) {
            return res.status(400).json({ success: false, message: 'User not found in the database.' });
        }

        // Verify the user account in the database (if not already verified)
        if (!student.isVerified) {
            student.isVerified = true;  // Automatically verify the user
            await student.save();       // Save the changes
        }

        // Generate JWT token
        const tokenPayload = {
            student: {
                id: student.id,
                role: student.role,
            },
        };
        const authToken = jwt.sign(tokenPayload, JWT_Token, { expiresIn: '1h' });

        // Respond with the JWT token and user details
        res.status(200).json({
            success: true,
            authToken,
            user: {
                id: student.id,
                email: student.email,
                role: student.role,
                isVerified: student.isVerified,
            },
        });
    } catch (err) {
        console.error('LDAP Error:', err.message);
        res.status(401).json({ success: false, error: err.message });
    }
});

module.exports = router;
