import React from 'react'
import LaserFlow from './laser-flow'

const Laser = () => {
    return (
        <div>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, left: '7%' }}>
                <LaserFlow
                    horizontalBeamOffset={-0.3}
                    verticalBeamOffset={0}

                    color="#ff7300"

                    horizontalSizing={3}
                    verticalSizing={0.3}

                    wispDensity={5}
                    wispSpeed={25}
                    wispIntensity={10}

                    flowSpeed={0.6}
                    flowStrength={0.5}

                    fogIntensity={0.25}
                    fogScale={1.2}
                    fogFallSpeed={0.4}

                    decay={1}
                    falloffStart={2}
                />
            </div>
        </div>
    )
}

export default Laser