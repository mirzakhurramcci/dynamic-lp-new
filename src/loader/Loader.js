import React from 'react';
import { getCDNUrl } from '../helper/index';
export default function Loader() {
    return (
        <img src={getCDNUrl("loading.gif")} className="loader" alt="" />
    )
}


