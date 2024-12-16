const statisticalModel = require('../models/statisticalModel');

exports.getTotalAmountByYear = (req, res) => {
    const { year } = req.body; 

    if (!year || isNaN(year)) {
        return res.status(400).json({ message: 'Invalid year provided' });
    }

    // Lấy tổng số tiền theo năm
    statisticalModel.getTotalAmountByYear(year, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching statistical data' });
        res.status(200).json(results);
    });
};
