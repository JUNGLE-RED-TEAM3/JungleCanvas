import React, { useState, useEffect } from 'react';
import './Webcam.css';
import axios from 'axios';

// YEONGWOO: provider 생성
import SessionContext from './SessionContext';

// OpenVidu
import { OpenVidu } from 'openvidu-browser';
import UserVideoComponent from './UserVideoComponent';

// Zustand
import useStore from '../store';

// Bootstrap-react
import Button from 'react-bootstrap/Button';

// BasicUI
import BasicUI from '../Game/BasicUI';

// react-bootstrap
import { Row, Col } from 'react-bootstrap';
// MRSEO: 
import socket from './socket';

// NOTE: 배포 전 확인!
const APPLICATION_SERVER_URL = "https://mysquidcanvas.shop/"
// const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'https://demos.openvidu.io/';

const Webcam = () => {
  const [mySessionId, setMySessionId] = useState('SessionA');
  const [myUserName, setMyUserName] = useState('Participant' + Math.floor(Math.random() * 100));
  const [session, setSession] = useState(undefined);
  const [publisher, setPublisher] = useState(undefined);
  const [subscribers, setSubscribers] = useState([]);

  // MRSEO: ZUSTAND 상태 변수 선언
  const { 
    setCanSeeAns,
    setDrawable,
    ans,
    setAns,
    round,
    redScoreCnt,
    setRedScoreCnt,
    blueScoreCnt,
    setBlueScoreCnt,
    phase,
    setPhase,
    gamers,
    setGamers,
    canSubmitAns,
   } = useStore();

  useEffect(() => {

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  const onBeforeUnload = (event) => {
    leaveSession();
  };

  const handleChangeSessionId = (e) => {
    setMySessionId(e.target.value);
  };

  const handleChangeUserName = (e) => {
    setMyUserName(e.target.value);
  };

  const joinSession = async(e) => {
    e.preventDefault();

    const OV = new OpenVidu();

    const mySession = OV.initSession();

    mySession.on('streamCreated', (event) => {
      var subscriber = mySession.subscribe(event.stream, undefined); 
      // mySession.subscribe : openvidu 세션(mySession)에 대해 스트림 구독
      
      // MRSEO: SUBSCRIBER 로직 업데이트 -> 다시 확인!
      // var subscribers = [...subscribers];
      setGamers({
        name: JSON.parse(event.stream.connection.data).clientData,
        streamManager: subscriber,
        // JANG: publisher와 동일하게 속성 두 개 추가
        // MRSEO: 08.04 상태를 true로 초기화
        drawable: true,
        canSeeAns: true,
      });
      
      subscribers.push(subscriber);
      setSubscribers(subscribers);
    });

    mySession.on("streamDestroyed", (event) => {
      // var subscribers = [...subscribers];

      // 1. subscribers 배열에서 해당 subscriber 제거
      const index = subscribers.indexOf(event.stream.streamManager);
      if (index > -1) {
        subscribers.splice(index, 1);
        setSubscribers(subscribers);
      }

      // 2. gamers 정보에서 해당 subscriber 제거
      useStore.getState().deleteGamer(JSON.parse(event.stream.connection.data).clientData);

      // 3. 방에 남아 있는 플레이어 수 업데이트
      // JANG: setPlayerCount 갱신되기 전 삭제하는 시점의 플레이어 수로 갱신되는 문제 해결
      // JANG: 일단 이거 없애니까, 지금까지 1) gamer 배열 중복 등록 방지 2) 세션 나가면 gamer 배열 갱신 성공 + 비디오 비워지고 새 유저 그 자리에
      // useStore.getState().setPlayerCount(useStore.getState().gamers.filter((a) => event.stream.streamManager.clientData !== a.name).length);



      // const deleteSubscriber = (streamManager, subscribers) => {
      //   let index = subscribers.indexOf(streamManager, 0); 
        
      //   useStore.getState().deleteGamer(JSON.parse(event.stream.connection.data).clientData);
      //   useStore.getState().setPlayerCount(useStore.getState().gamers.length);

      //   if (index > -1) {
      //     subscribers.splice(index, 1);  // subscribers 배열에서 해당 streamManager 삭제
      //     return subscribers;
      //   }
      // };

      // setSubscribers(deleteSubscriber(event.stream.streamManager, subscribers));
    });

    mySession.on('exception', (exception) => {
      console.warn(exception);
    });

    try{
        const token = await getToken(); 
        await mySession.connect(token, { clientData: myUserName })
        .then(async () => {
            let publisher = await OV.initPublisherAsync(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: '640x480',
              frameRate: 30,
              insertMode: 'APPEND',
              mirror: false,
            });
  
            mySession.publish(publisher);
  
            setGamers({
              name: myUserName,
              streamManager: publisher,
              // MRSEO: gamer의 drawable, canSeeAns 상태 변수 추가
              // MRSEO: 08.04 상태를 true로 초기화
              drawable: true,
              canSeeAns: true,
            });
  
            // useStore.getState().setMyUserID(myUserName);
            setPublisher(publisher);
          })
    }
    catch (error) {
      console.log('There was an error connecting to the session:', error.code, error.message);
    }

    setSession(mySession);

  };

  const leaveSession = () => {
    const mySession = session;

    if (mySession) {
      mySession.disconnect();
    }

    useStore.getState().clearGamer();

    setSession(undefined);
    setSubscribers([]);
    setMySessionId('SessionA');
    setMyUserName('Participant' + Math.floor(Math.random() * 100));
    setPublisher(undefined);
  };

  // MRSEO: 정답 제출
  const submitAns = () => {
    if ( !useStore.getState().canSubmitAns ) return;
    if ( round === 1 ){
      if ( ans === '사과' ){
        
        setCanSeeAns(!gamers[0].canSeeAns, gamers[0].name);
        setDrawable(!gamers[0].drawable, gamers[0].name);

        setCanSeeAns(!gamers[2].canSeeAns, gamers[2].name);
        setDrawable(!gamers[2].drawable, gamers[2].name);

        setRedScoreCnt(redScoreCnt + 1);

      }
    }
    if ( round === 2 ){
      if ( ans === '' ){

        setCanSeeAns(!gamers[1].canSeeAns, gamers[1].name);
        setDrawable(!gamers[1].drawable, gamers[1].name);

        setCanSeeAns(!gamers[3].canSeeAns, gamers[3].name);
        setDrawable(!gamers[3].drawable, gamers[3].name);

        setBlueScoreCnt(blueScoreCnt + 1);
      }
    }
      setAns('');
  };

// MRSEO: 게임 초기화
const GameInitializer = () => {
  if ( round === 1 ){
      for (let i = 0; i < gamers.length; i++) {
          if ( i === 0 ){
              setCanSeeAns(false, gamers[i].name);
              setDrawable(false, gamers[i].name);
          } else if ( i === 1 || i === 3) {
              setCanSeeAns(true, gamers[i].name);
              setDrawable(false, gamers[i].name);
          } else {
              setCanSeeAns(false, gamers[i].name);
              setDrawable(false, gamers[i].name);
          }
      }
  }

  if ( round === 2 ){
      for (let i = 0; i < gamers.length; i++) {
          if ( i === 1 ){
              setCanSeeAns(true, gamers[i].name);
              setDrawable(true, gamers[i].name);
          } else if ( i === 0 || i === 2) {
              setCanSeeAns(true, gamers[i].name);
              setDrawable(false, gamers[i].name);
          } else {
              setCanSeeAns(false, gamers[i].name);
              setDrawable(false, gamers[i].name);
          }
      }
  }
  // console.log(gamers);
}


  const handleGameStart = () => {
    // MRSEO: 게임 시작 버튼 누르면, 게임 시작, useStore.getState()지움
    GameInitializer();
    setPhase('Game');
    socket.emit('gameStart');
  };


  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    console.log('getToken' + sessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId) => {
    console.log('create' + sessionId);
    const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
      headers: { 'Content-Type': 'application/json', },
    });
    return response.data; // The sessionId
  };

  const createToken = async (sessionId) => {
    console.log('createToken' + sessionId);
    const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
      headers: { 'Content-Type': 'application/json', },
    });
    return response.data; // The token
  };

  
  const consoleCommand = () => {
    console.log(gamers);
    // setCanSeeAns(!gamers[0].canSeeAns, gamers[0].name);
    // setDrawable(!gamers[0].drawable, gamers[0].name);
  }

  return (

    <div className="Wrapper">

      {session === undefined ? (
        
        <div className="JoinForm">

            {/* <div className="JoinForm_Header" id="img-div">
                <img src="resources/images/main-card.jpeg" alt="logo" />
            </div> */}

                <h1> 게임 참가 </h1>
                <form className="form-group" onSubmit={joinSession}>
                    <p>
                        <label>Participant: </label>
                        <input
                            className="form-control"
                            type="text"
                            id="userName"
                            value={myUserName}
                            onChange={handleChangeUserName}
                            required
                        />
                    </p>
                    <p>
                        <label> Session: </label>
                        <input
                            className="form-control"
                            type="text"
                            id="sessionId"
                            value={mySessionId}
                            onChange={handleChangeSessionId}
                            required
                        />
                    </p>
                    <div className="JoinForm_Button">
                        <input name="commit" type="submit" value="JOIN" />
                    </div>
                </form>
        </div>

        ) : null}

        {session !== undefined ? (
            <>
            {/* MRSEO: useStore.getState()지움 */}
            {useStore.getState().phase === 'Ready' || useStore.getState().phase === 'Game' ? (
              // JANG: 게임 대기방으로 만들기!
                <div className="GameForm">

                      {/* JANG: 게임 대기방 */}
                      <SessionContext.Provider value={{ mySessionId, myUserName }}>
                        <BasicUI />
                      </SessionContext.Provider>
                      

                      <Row>
                      <Col xs={3}></Col>
                      <Col xs={2}></Col>
                      <Col xs={2}>
                      <Button>
                        PASS
                      </Button>

                      {/* MRSEO: 참가자 수 출력 테스트 */}
                      {/* JANG: 나중에 확인하고 버릴 거! */}
                      <button onClick={consoleCommand}>test</button>

                      {useStore.getState().phase === 'Game' ? (
                        <>
                        {/* MRSEO: useStore.getState()지움 */}
                        {useStore.getState().gamers.map((gamer) =>
                          ( gamer.drawable === false && gamer.canSeeAns === false ? (
                          // JANG: TODO - 정답 입력창 css 수정
                          <div>
                            <input placeholder='정답을 입력하시오' value={ans} onChange={(e) => setAns(e.target.value)}/>
                            <button onClick={submitAns}>제출</button>
                          </div>):null))}
                        </>
                      ):null}
                      {/* <div className="GameForm_Button"> */}
                          <Button
                          variant='danger'
                          size='lg'
                          className="exit_button"
                          onClick={leaveSession}
                          value="Exit"
                          >
                          Exit
                          </Button>
                          {' '}
                          {/* Start 버튼은 4명이 다 차면 뜨도록 변경! */}
                        {useStore.getState().gamers.length === 4 ? (
                          <Button
                          variant='primary'
                          size='lg'                          
                          type="submit"
                          className="gameStart_button"
                          onClick={handleGameStart}
                          >
                          Start
                          </Button>
                        ):null} 
                      {/* </div> */}
                      </Col>
                      <Col xs={2}></Col>
                      <Col xs={3}></Col>
                      </Row>

                    </div>
                    ) : null }

                  {useStore.getState().gameStart === true && useStore.getState().gameEnd === false ? (
                    
                    // JANG: 게임 시작 방으로 만들기!
                    <div className="GameForm_Body">
                        {/* useStore.getState().gameStart -> false이면, 캔버스 lock 걸고
                            useStore.getState().gameStart -> true이면, 캔버스 lokc 풀기 + 게임 시작
                        */}
                        <div className="GameForm_Content">
                          
                            
              
                        </div>
                    </div>
                ):null}
          </>
          ) : null}

                  
                {/* useStore.getState().gameEnd === false ? 
                useStore.getState().gameEnd === true ? ( */}
                    <>
                    {/* 게임 끝났을 때 */}
                    </>

    </div>

    )
}

export default Webcam;
