const logRequest = (req, res, next) => {
    res.on('finish', () => {

        const level = res.statusCode >= 500 ? 'ERROR'
                    : res.statusCode >= 400 ? 'WARN'
                    : 'INFO';
        
        console.log(`[${level}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
    });
    next();
};

module.exports = logRequest;