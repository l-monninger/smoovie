const MU = .00001


const getShapeDerivatives = (shape)=>{
    return shape.slice(1).map((element, index)=>{
        return element - shape[index];
    })
}

const _getNextDerivative = (currentIndex, derivatives)=>{

    return derivatives[currentIndex];
}

const _getPreviousDerivative = (currentIndex, derivatives)=>{
    return derivatives[currentIndex-1];
}

const getNextDerivative = (shape, currentIndex, derivatives)=>{

    return currentIndex < (shape.length - 1) ? _getNextDerivative(currentIndex, derivatives) : _getPreviousDerivative(currentIndex, derivatives);
}

const getPreviousDerivative = (currentIndex, derivatives)=>{
    return currentIndex > 0 ? _getPreviousDerivative(currentIndex, derivatives) : _getNextDerivative(currentIndex, derivatives);
}

const getAnalogStepSize = (shape, analog)=>{
    return (shape.length - 1)/(analog.length - 1);
}

const getAnalogFractionalIndex = (shape, index, analog)=>{

    return index * getAnalogStepSize(shape, analog);
}

const isOnIndex = (fractionalIndex)=>{
    return (fractionalIndex % 1) < MU; 
}

const getNextShapeIndex = (fractionalIndex)=>{
    return fractionalIndex ? Math.ceil(fractionalIndex) : 1;
}

const getPreviousShapeIndex = (fractionalIndex)=>{
    return Math.floor(fractionalIndex);
}

const getNextShapeMidpoint = (fractionalIndex)=>{
    return getNextShapeIndex(fractionalIndex) + .5;
}

const getAnalogPreviousDerivative = (analog, currentIndex, shape, derivatives)=>{
    return currentIndex > 0 ?
        analog[currentIndex] - analog[currentIndex - 1]
        : getPreviousDerivative(currentIndex, derivatives);
}

const getDerivativeToTargetValue = (targetValue, currentValue, fractionalIndex)=>{

    return (targetValue - currentValue)/((getNextShapeIndex(fractionalIndex) - fractionalIndex) + MU);
}

const computeDesiredDerivative = (previousDerivative, derivativeToTargetValue, distanceToTargetValue, midpointDerivative)=>{

    const distanceToMidpoint = distanceToTargetValue + .5;

    const diffTargetDerivative = derivativeToTargetValue - previousDerivative;
    const diffMidpointDerivative = midpointDerivative - previousDerivative;

    const targetWeight = (diffTargetDerivative||MU) * (1/(distanceToTargetValue + MU)) * (1/MU);
    const midpointWeight = (diffMidpointDerivative||MU) * (1/(distanceToMidpoint + MU)) * MU;

    return ( (derivativeToTargetValue * targetWeight) + (midpointDerivative * midpointWeight) )/ (targetWeight + midpointWeight); 

}


const computeNextAnalogValue = (shape, index, analog, derivatives)=>{


    const fractionalIndex = getAnalogFractionalIndex(shape, index, analog);
    const nextShapeIndex = getNextShapeIndex(fractionalIndex);
    const midpointDerivative = getNextDerivative(shape, nextShapeIndex, derivatives);
    const targetValue = shape[nextShapeIndex];
    const previousAnalogDerivative = getAnalogPreviousDerivative(analog, index, shape, derivatives);
    const derivativeToTargetValue = getDerivativeToTargetValue(targetValue, analog[index], fractionalIndex);
    const distanceToNextShape = nextShapeIndex - fractionalIndex;
    const stepSize = getAnalogStepSize(shape, analog);
    const deriv = computeDesiredDerivative(previousAnalogDerivative, derivativeToTargetValue, distanceToNextShape, midpointDerivative);

    return deriv * stepSize + analog[index];

}

const createNewAnalog = (shape, range)=>{

    return Array.apply(0, Array(range)).map((val, index)=>{
        return index ? 0 : shape[0];
    })

}

const computeAnalogArray = (shape, range)=>{

    const analog = createNewAnalog(shape, range);

    const derivatives = getShapeDerivatives(shape);

    analog.forEach((val, index)=>{
        analog[index] = index < 1 ? shape[index] : computeNextAnalogValue(shape, index - 1, analog, derivatives);
    })

    return analog;

}

