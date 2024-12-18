import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    ContentContainer,
    Wrap,
    EmotionMoodWrap,
    EmotionWrap,
    MusicContainer,
    MoodContainer,
    MainEmotionContainer,
    SubEmotionContainer,
    ReactionContainer,
    ButtonContainer,
    ShareButtonContainer,
    ReactionShareWrap
} from './DetailPage.styled';
import { ShowMusicContainer } from '@/widgets/show-music';
import { ShowMoodContainer } from '@/widgets/show-mood';
import { ShowMainEmotionContainer } from '@/widgets/show-main-emotion';
import { ShowSubEmotionContainer } from '@/widgets/show-sub-emotion';

import { emotionMapping } from '@/shared/model/EmotionEnum';
import { ConditionType } from '@/shared/model/conditionTypes';
import DiaryText from '@/widgets/diary-text/ui/DiaryText';
import ReactionSelector from '@/widgets/reaction-selector/ui/ReactionSelector';
import { useAuthStore } from '@/features/login/hooks/useAuthStore';
import Button from '@/shared/ui/Button/Button';
import { ShareButton } from '@/entities/ShareButton';
import { ScaleLoader } from 'react-spinners';

import { useToastStore } from '@/features/Toast/hooks/useToastStore';

interface DiaryData {
    id: number;
    title: string;
    content: string;
    is_public: boolean;
    title_date: string;
    updated_date: string;
    author_email: string;
    author_name: string;

    mood: ConditionType;
    emotion: string;
    sub_emotion: string;
    music_url: string;
    music_imgurl: string;
    music_title: string;
    artist: string;

    reactions: string;
}

export const DetailPage = () => {
    const { email, isLoggedin } = useAuthStore();
    const token = localStorage.getItem('token') || '';
    const { addToast } = useToastStore();
    const navigate = useNavigate();

    const { id } = useParams();
    const [data, setData] = useState<DiaryData | null>(null);

    const url = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${url}/diary/${id}`);
                const result: DiaryData = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, [id]);

    if (!data) {
        return <ScaleLoader color="#DBDBDB" />; // 데이터 로딩 중 표시
    }

    // 구조 분해로 변수 할당
    const {
        id: diaryId,
        title,
        author_email: autherEmail,
        author_name: autherName,
        content,
        is_public: isPublic,
        title_date: titleDate,
        updated_date: updatedDate,

        mood,
        emotion,
        sub_emotion: subEmotion,

        music_url: youtubeId,
        music_imgurl: albumCover,
        music_title: songTitle,
        artist: artistName
    } = data;

    const transTitleDate = new Date(titleDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });

    const transUpdatedDate = new Date(updatedDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    // 서브 감정을 매핑
    const transSubEmotion = JSON.parse(subEmotion).map(
        (emo: string) => emotionMapping[emo] ?? emo
    );

    const deleteDiary = async () => {
        try {
            const response = await fetch(`${url}/diary?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token.replace(/"/g, '')}`
                }
            });

            if (response.ok) {
                addToast('삭제 성공!', 'success');
            } else {
                addToast('삭제 실패!', 'warning');
            }
        } catch (error) {
            addToast('에러 발생!', 'error');
        }
    };

    const handleClickEditButton = () => {
        navigate(`/diarywrite/${id}/edit`);
    };

    return (
        <Container>
            <ContentContainer>
                <DiaryText
                    titleDate={transTitleDate}
                    title={title}
                    author={autherName}
                    updateDate={`작성일 ${transUpdatedDate}`}
                    diaryContent={content}
                    isPublic={isPublic}
                    onVisibilityChange={() => !isPublic}
                />
            </ContentContainer>

            <Wrap>
                <EmotionMoodWrap>
                    <MoodContainer>
                        <ShowMoodContainer mood={mood} />
                    </MoodContainer>
                    <EmotionWrap>
                        <MainEmotionContainer>
                            <ShowMainEmotionContainer
                                emotion={emotionMapping[emotion]}
                            />
                        </MainEmotionContainer>
                        <SubEmotionContainer>
                            <ShowSubEmotionContainer
                                subEmotions={transSubEmotion}
                            />
                        </SubEmotionContainer>
                    </EmotionWrap>
                </EmotionMoodWrap>
                <MusicContainer>
                    <ShowMusicContainer
                        youtubeId={youtubeId}
                        thumbnailUrl={albumCover}
                        title={songTitle}
                        artist={artistName}
                    />
                </MusicContainer>
            </Wrap>

            <ReactionShareWrap>
                <ReactionContainer>
                    <ReactionSelector
                        diaryId={diaryId}
                        userEmail={email}
                        isHorizontal={false}
                        isAddBtnVisible={isLoggedin}
                        token={token.replace(/"/g, '')}
                    />
                </ReactionContainer>
                <ShareButtonContainer>
                    <ShareButton />
                </ShareButtonContainer>
            </ReactionShareWrap>

            {isLoggedin && email === autherEmail && (
                <ButtonContainer>
                    <Button
                        isActive
                        height="55px"
                        width="100%"
                        fontSize="20px"
                        onClick={() => {
                            handleClickEditButton();
                        }}
                        hasBorder
                    >
                        수정하기
                    </Button>
                    <Button
                        height="55px"
                        width="100%"
                        fontSize="20px"
                        onClick={() => {
                            deleteDiary();
                            navigate('/');
                        }}
                    >
                        삭제하기
                    </Button>
                </ButtonContainer>
            )}
        </Container>
    );
};
