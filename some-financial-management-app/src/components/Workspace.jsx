import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizeable/css/styles.css';
import Panel from './Panel';
import BanksPanel from './panels/BanksPanel';

const ResponsiveGrid = WidthProvider(Responsive);

const availablePanels = [
    { id: 'banks', title: 'Banks' },
];

const defaultLayouts = {
    lg : [
        { i: 'banks', x: 0, y: 0, w: 3, h: 4}
    ]
};

const defaultVisible = ['banks'];

function Workspace({ token, setToken }) {
    const [panels, setPanels] = useState([]);

    return (
        <div className="workspace">
            <div className="menu-bar">
                <span className="menu-item">Account</span>
                <span className="menu-item add-panel-button" onCLick
                <span className="menu-item">View</span>
                <span className="menu-item">Settings</span>
            </div>
            <div className="panel-area">
                {panels.length === 0 && <p>Add a panel from the View menu</p>}
            </div>
        </div>
    );
}

export default Workspace