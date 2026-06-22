import React, { useState } from 'react';

function Workspace({ token, setToken }) {
    const [panels, setPanels] = useState([]);

    return (
        <div className="workspace">
            <div className="menu-bar">
                <span className="menu-item">Account</span>
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