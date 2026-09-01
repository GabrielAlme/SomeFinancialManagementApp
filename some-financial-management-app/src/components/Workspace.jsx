import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
//Panel imports
import Panel from './Panel';
import { 
    BanksPanel, 
    AccountsPanel, 
    TransactionsPanel, 
    MonthlyPaymentsPanel, 
    } from './panels';


const ResponsiveGrid = WidthProvider(Responsive);


//Panels available to user
const availablePanels = [
    { id: 'banks', title: 'Banks', component: BanksPanel },
    { id: 'accounts', title: 'Accounts', component: AccountsPanel },
    { id: 'transactions', title: 'Transactions', component: TransactionsPanel },
    { id: 'monthly', title: 'Monthly Payments', component: MonthlyPaymentsPanel },
];

//Default sizes of panels
const defaultLayouts = {
    lg : [
        { i: 'banks', x: 0, y: 0, w: 2, h: 6 },
        { i: 'accounts', x: 0, y: 7, w: 2, h: 9 },
        { i: 'transactions', x: 2, y: 0, w: 4, h: 15 },
        { i: 'monthly', x: 6, y: 0, w: 3, h: 15 },
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
    const [selectedBank, setSelectedbank] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);

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

            // Add default layout for the new panel if it doesn't exist
            const defaultLayout = defaultLayouts.lg.find(l => l.i === panelId);
            if (defaultLayout) {
                setLayouts(prev => ({
                    ...prev,
                    lg: [...(prev.lg || []), defaultLayout],
                }));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const getPanelProps = (panelId) => {
        switch (panelId) {
            case 'banks':
                return {
                    token,
                    selectedBank,
                    onSelectBank: (bank) => {
                        setSelectedbank(bank);
                        setSelectedAccount(null);
                    }
                };
            case 'accounts':
                return {
                    token,
                    selectedBank,
                    selectedAccount,
                    onSelectAccount: setSelectedAccount,
                };
            case 'transactions':
                return {
                    token,
                    selectedBank,
                    selectedAccount,
                };
            default:
                return { token }; 
        }
    };

    const [previousLayouts, setPreviousLayouts] = useState(null);
const [draggingId, setDraggingId] = useState(null);

const handleDragStart = (layout, oldItem) => {
    setPreviousLayouts(JSON.parse(JSON.stringify(layouts)));
    setDraggingId(oldItem.i);
};

const handleDragStop = (layout) => {
    const panelAreaEl = document.querySelector('.panel-area');
    if (!panelAreaEl) return;

    const maxRows = Math.floor(panelAreaEl.clientHeight / 50);
    const maxCols = 12;

    // Check if every panel fits within bounds
    const isValid = layout.every(item => 
        item.x >= 0 &&
        item.x + item.w <= maxCols &&
        item.y >= 0 &&
        item.y + item.h <= maxRows
    );

    if (!isValid) {
        setLayouts(previousLayouts);
    }

    setDraggingId(null);
    setPreviousLayouts(null);
};

const handleLayoutChange = (layout, allLayouts) => {
    if (draggingId) {
        // While dragging, only update the dragged panel's position
        // Keep all other panels frozen
        const frozenLayout = previousLayouts.lg.map(item => {
            if (item.i === draggingId) {
                return layout.find(l => l.i === draggingId) || item;
            }
            return item;
        });
        setLayouts({ ...allLayouts, lg: frozenLayout });
    } else {
        setLayouts(allLayouts);
    }
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
    className="layout"
    layouts={layouts}
    breakpoints={{ lg: 1200, md: 996, sm: 768 }}
    cols={{ lg: 12, md: 9, sm: 6 }}
    rowHeight={50}
    onLayoutChange={handleLayoutChange}
    onDragStart={handleDragStart}
    onDragStop={handleDragStop}
    draggableHandle=".panel-header"
    isResizable={true}
    isDraggable={true}
    compactType={null}
>
                    {visiblePanels.map(panelId => {
                        const panel = availablePanels.find(p => p.id === panelId);
                        const PanelComponent = panel.component;
                        return (
                        <div key={panelId}>
                            <Panel title={panel.title} onClose={() => togglePanel(panelId)}>
                                <PanelComponent {...getPanelProps(panelId)} />
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