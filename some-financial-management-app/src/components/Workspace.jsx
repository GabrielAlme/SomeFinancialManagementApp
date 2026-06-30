import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
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

    return (
        <div className="workspace">
            <div className="menu-bar">
                <div className="menu-left">
                    <span className="menu-item">Account </span>
            
                    <span className="menu-item add-panel-button" onClick={() => setPanelMenuOpen(!panelMenuOpen)}>
                        Add Panel + {panelMenuOpen && (
                            <div className="dropdown">
                                {availablePanels.map(panel =>(
                                    <div key = {panel.id} className="dropdown-item" onClick={(e) => {
                                        e.stopPropagation();
                                        togglePanel(panel.id);
                                    }}>
                                        <span className="checkbox">
                                            {visiblePanels.includes(panel.id) ? '☑' : '☐'}
                                        </span>
                                        {panel.title}
                                    </div>
                                ))}
                            </div>
                            
                        )}
                    </span>

                    <span className="menu-item">View </span>
                    <span className="menu-item">Settings</span>
                </div>
            </div>
            <div className="panel-area">
                <ResponsiveGrid 
                    className="layout" layouts={layouts} 
                    breakpoints={{ lg: 1200, md: 996, sm:768 }}
                    cols={{ lg: 12, md: 9, sm:6 }} rowHeight={50}
                    onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
                    draggableHandle=".panel-header"
                    isResizable={true}
                    isDraggable={true}
                >
                    {visiblePanels.map(panelId => {
                        const panel = availablePanels.find(p => p.id === panelId);
                        const PanelComponent = panel.component;
                        return (
                        <div key={panelId}>
                            <Panel title={panel.title} onClose={() => togglePanel(panelId)}>
                                <PanelComponent token={token} />
                            </Panel>
                        </div>
                        );
                    })}
                </ResponsiveGrid>
            </div>
        </div>
    );
}

export default Workspace