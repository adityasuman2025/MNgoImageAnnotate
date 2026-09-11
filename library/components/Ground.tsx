import { memo } from "react";
import Element from "./Element";

function Ground() {
    return (
        <div className="w-full absolute inset-0 flex-1 relative">
            <Element />
        </div>
    );
}

export default memo(Ground);