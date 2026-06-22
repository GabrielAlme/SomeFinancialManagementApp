import React from 'react';

function Panel({ title, onClose, children }) {
    return (
        <div className="panel">
            <div className="panel-header">
                <span className="panel-title">{title}</span>
                <span className="panel-close" onClick={onClose}>x</span>
            </div>
            <div className="panel-content">
                {children}
            </div>
        </div>
    );
}

export default Panel;