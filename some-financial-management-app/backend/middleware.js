const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        console.log('Auth header:', req.headers.authorization);
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log('No token found');
            return res.status(401).json({ error: 'No token provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded', decoded);

        req.userId = decoded.userId;

        next();
    }   catch (error){
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;