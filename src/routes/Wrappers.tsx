import React from 'react';
import { useOutletContext } from 'react-router-dom';
import InputTab from '../components/input/InputTab';
import OutputTab from '../components/output/OutputTab';
import { AppContextType } from '../context/OutletContext';

export const InputWrapper: React.FC = () => {
    const { doeFactors, handleGenerateDesign } = useOutletContext<AppContextType>();
    return <InputTab factors={doeFactors} onGenerate={handleGenerateDesign} />;
};

export const OutputWrapper: React.FC = () => {
    const {
        doeRuns,
        doeFactors,
        setDoeRuns,
        ySpecs,
        setYSpecs,
        optimizerInputs,
        setOptimizerInputs,
        demoActive,
        setDemoActive
    } = useOutletContext<AppContextType>();

    return (
        <OutputTab
            runs={doeRuns}
            factors={doeFactors}
            onUpdateRuns={setDoeRuns}
            ySpecs={ySpecs}
            onYSpecsChange={setYSpecs}
            optimizerInputs={optimizerInputs}
            onOptimizerInputsChange={setOptimizerInputs}
            demoActive={demoActive}
            onDemoComplete={() => setDemoActive(false)}
        />
    );
};
