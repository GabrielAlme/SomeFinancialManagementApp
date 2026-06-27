import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizeable/css/styles.css';
import Panel from './Panel';
import BanksPanel from './panels/BanksPanel';

const ResponsiveGrid = WidthProvider(Responsive);

const availablePanels = [
    { id: 'banks', title: 'Banks', component: BanksPanel },
];

const defaultLayouts = {
    lg : [
        { i: 'banks', x: 0, y: 0, w: 3, h: 4}
    ]
};

const defaultVisible = ['banks'];

function Workspace({ token, setToken }) {
    const [visiblePanels, setVisiblePanels] = useState(() => {
        const saved = localStorage.getItem('visiblePanels');
        return saved ? JSON.parse(saved) : defaultVisible;
    })

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('panelLayouts');
        return saved ? JSON.parse(saved) : defaultLayouts;
    })

    const [panelMenuOpen, setPanelMenuOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('visiblePanels', JSON.stringify(visiblePanels));
    }, [visiblePanels]);

    useEffect(() => {
        localStorage.setItem('panelLayouts', JSON.stringify(layouts));
    }, [layouts]);

    const togglePanel = (panelId) => {
        if (visiblePanels.includes(panelId)) {
            setVisiblePanels(visiblePanels.filter(id => id !== panelId));
        } else {
            setVisiblePanels([...visiblePanels, panelId]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    {visiblePanels.map(paneId => {
        const panel = availablePanels.find(p => p.id === panelId);
        const panelComponent = panel.component;
        return (
            <div key={panelId}>
                <Panel title={panel.title} onClose={() => togglePanel(panelId)}>
                    <PanelComponent token={token} />
                </Panel>
            </div>
        );
    })}

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