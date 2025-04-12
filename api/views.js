const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'views.json');

    if (req.method === 'GET') {
        const data = fs.readFileSync(filePath, 'utf-8');
        const views = JSON.parse(data);
        res.status(200).json({ views: views.nanoMachineViews });
    } else if (req.method === 'POST') {
        const data = fs.readFileSync(filePath, 'utf-8');
        const views = JSON.parse(data);

        views.nanoMachineViews += 1;

        fs.writeFileSync(filePath, JSON.stringify(views, null, 2));
        res.status(200).json({ views: views.nanoMachineViews });
    } else {
        res.status(405).json({ message: 'Yalnızca GET ve POST isteklerine izin verilir.' });
    }
}
