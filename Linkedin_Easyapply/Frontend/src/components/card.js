import React from 'react';

const Card = ({ title, content }) => (
    <div className="card">
        <div className="card-header">{title}</div>
        <div className="card-content">
            <p>{content}</p>
            <a href="#" className="apply-btn">Apply Here</a>
        </div>
    </div>
);

export default Card;
