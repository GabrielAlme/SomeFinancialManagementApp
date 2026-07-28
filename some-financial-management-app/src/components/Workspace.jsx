import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
//Panel imports
import Panel from './Panel';
import BanksPanel from './panels/BanksPanel';
import AccountsPanel from './panels/AccountsPanel';
import TransactionsPanel from './panels/TransactionsPanel';

const ResponsiveGrid = WidthProvider(Responsive);

const availablePanels = [
    { id: 'banks', title: 'Banks', component: BanksPanel },
    { id: 'accounts', title: 'Accounts', component: AccountsPanel },
    { id: 'transactions', title: 'Transactions', component: TransactionsPanel },
];

const defaultLayouts = {
    lg : [
        { i: 'banks', x: 0, y: 0, w: 3, h: 4 },
        { i: 'accounts', x: 3, y: 0, w: 5, h: 6 },
        { i: 'transactions', x: 8, y: 0, w: 4, h: 8 },
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