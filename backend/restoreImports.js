const fs = require('fs');

let content = fs.readFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', 'utf8');

const missingImports = `import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Box, Calendar, Trash2 } from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';\n`;

content = missingImports + content;

fs.writeFileSync('d:/Project - II/Smart--Bake--Hub/frontend/src/pages/admin/Reports.jsx', content);
console.log("Imports restored!");
