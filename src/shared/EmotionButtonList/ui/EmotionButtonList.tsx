import React, { useState, useEffect } from 'react';
import { StyledEmotionButtonList } from './EmotionButtonList.styled';
import EmotionButton from '../../EmotionButton/ui/EmotionButton';
import { Emotions } from '../../model/EmotionEnum';

interface EmotionListProps {
    isPrimary: boolean;
    maxSelections: number;
    initialSelectedEmotions: Emotions[];
    onSelectionChange: (selectedEmotions: Emotions[]) => void;
}

/**
 *  게시글에 대한 반응을 선택하는 버튼 리스트 컴포넌트입니다.<br/>
 * 대표 감정 모드와 서브 감정 모드를 지원하며, 초기 선택된 감정을 설정하고 최대 선택 가능 수를 제한할 수 있습니다.
 */

/* ***********************************************************
TODO - 해결
SelectEmotionContainer.tsx:27 Warning: Cannot update a component (`SelectEmotionContainer`) while rendering a different component (`EmotionList`). To locate the bad setState() call inside `EmotionList`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
    at EmotionList
 ********************************************************** */

const EmotionList: React.FC<EmotionListProps> = ({
    isPrimary = true,
    maxSelections,
    initialSelectedEmotions = [],
    onSelectionChange
}) => {
    const [selectedEmotions, setSelectedEmotions] = useState<Emotions[]>([]);

    useEffect(() => {
        if (isPrimary) {
            if (initialSelectedEmotions.length > 0) {
                setSelectedEmotions([initialSelectedEmotions[0]]);
                onSelectionChange([initialSelectedEmotions[0]]);
            } else {
                setSelectedEmotions([]);
                onSelectionChange([]);
            }
        } else {
            const validInitialEmotions = initialSelectedEmotions.slice(
                0,
                maxSelections
            );
            setSelectedEmotions(validInitialEmotions);
            onSelectionChange(validInitialEmotions);
        }
    }, [isPrimary, initialSelectedEmotions, onSelectionChange, maxSelections]);

    const handleEmotionClick = (emotion: Emotions) => {
        setSelectedEmotions((prev) => {
            let newSelection: Emotions[];

            if (isPrimary) {
                newSelection = [emotion];
            } else {
                // eslint-disable-next-line no-lonely-if
                if (prev.includes(emotion)) {
                    newSelection = prev.filter((e) => e !== emotion);
                } else if (prev.length < maxSelections) {
                    newSelection = [...prev, emotion];
                } else {
                    alert(`최대 ${maxSelections}개 감정만 선택할 수 있습니다.`);
                    newSelection = prev;
                }
            }

            onSelectionChange(newSelection);
            return newSelection;
        });
    };

    return (
        <StyledEmotionButtonList>
            {Object.values(Emotions).map((emotion) => (
                <EmotionButton
                    key={emotion}
                    emotion={emotion}
                    initialClicked={selectedEmotions.includes(emotion)}
                    onClick={() => handleEmotionClick(emotion)}
                    disabled={false}
                />
            ))}
        </StyledEmotionButtonList>
    );
};

export default EmotionList;