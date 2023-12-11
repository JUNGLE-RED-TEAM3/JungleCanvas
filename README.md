# 🦑 SquidCanvas 🦑
(팀명 : JungleCanvas)

### `SquidCanvas`는 공유 캔버스를 활용한 화상 웹 게임'입니다!

![image](https://github.com/JUNGLE-RED-TEAM3/JungleCanvas/assets/108510272/dae23163-63bb-42d6-b875-3034fc78fbe3)




## SQUIDCANVAS 시연 (영상)
[https://youtu.be/MURQ6iLsth0](https://youtu.be/MURQ6iLsth0)


## 게임 소개
`SQUID CANVAS`는 그림을 그리며, 떨어져 있는 친구들과 즐거운 시간을 보낼 수 있는 컨텐츠입니다. 

2대 2로 즐기는 **스피드 퀴즈모드**와 

이어 그리기 형식으로 진행되며, 눈치 싸움이 중요한 **스파이 모드**가 있습니다. 

서로의 얼굴을 보며, 그림이라는 매개체로 즐거운 추억을 쌓아보세요!

**(스파이 퀴즈 모드)**

![발표영상 SQUID CANVAS (1)](https://github.com/JUNGLE-RED-TEAM3/JungleCanvas/assets/108510272/4af1eef3-85ad-423a-86db-1a81b52ab5ee)


**(스피드 퀴즈 모드 GIF)**


## 주요 기능
 
### 실시간 통신 🌐
: webRTC 기술을 사용하여 여러 사람들이 이용하는데 강점이 있는 SFU 방식의 OpenVidu로 실시간 통신을 구현

### 공유 캔버스 🎨
: canvas API를 활용한 공유캔버스에 리액트의 상태값으로 유저별 접근 권한을 조정하여 그림을 그리는 게임 구현

## 서비스 아키텍처
![image](https://github.com/JUNGLE-RED-TEAM3/JungleCanvas/assets/129301830/3b19f977-f84b-4b13-8314-e3bdbbbf8a42)



## 기술적 챌린지
### 1. 실시간 통신 (Openvidu) 
**1) SFU 방식의 Openvidu 라이브러리 선택 💦**

👉 (개선 과정)
- 웹 기반 실시간 통신을 구현하기 위해 WebRTC 기술을 검토하던 중 4 명 이상의 사용자 간의 효율적인 통신을 위해 mesh 방식의 제약이 나타날 수 있다는 사실을 인지하게 됨

- Mesh 방식은 모든 사용자 간에 직접적인 연결이 필요하며, 이로 인해 사용자 수가 증가할수록 네트워크 부하와 대역폭 문제가 복잡도를 증가시키는 주요 원인이 됨

- 이러한 문제를 극복하기 위해 SFU (Selective Forwarding Unit) 방식을 채택하기로 결정함

- SFU는 다중 사용자 환경에서의 효율적인 데이터 전송을 가능하게 해 주는 중앙 집중화된 미디어 서버로, 사용자들은 모두 서버에 연결되며, 서버가 수신한 데이터를 필요한 사용자에게만 전달하는 방식으로 동작함

- 이로써 모든 사용자 간의 직접 연결을 피하고 네트워크 부하를 줄일 수 있게 됨

### 2. 공유 캔버스
**1) 펜 끊김 현상 개선 💦**

👉 쓰로틀 함수로 함수 주기를 짧게 설정하여 마우스 이벤트를 같은시간에 더 많이 발생시켜 문제 상황 개선

**2) 캔버스 리사이징 문제 및 화질 저하 💦**

👉 캔버스를 2배로 줌 땡겨놓고 x,y 좌표도 스케일 값으로 그에 비례하게 설정하여 화질 개선

### 3. 그 외

**1) 클라이언트 별 타이머 동기화 문제와 node-cron 도입과정 (진행중)💦**

- 처음 생각했던 방식은 클라이언트에서 돌아가도록  타이머를 setIntervel로 구현함

- 근데 각 클라이언트마다 타이머가 다르게 돌아가는 문제 발생

- 그래서 서버에 타이머를 두고 소켓 통신을 이용해서 서버 기준으로 모든 클라이언트에게 타이머 값을 줘서 동기화를 시킴 (서버로 타이머를 옮겨서 동기화 문제를 해결함)

- 그런데 타이머를 setInterval로 만드는 건 브라우저나 node.js환경에 따라 정확성이 달라질 수 있어 정확한 간격을 보장하지 않는다는 점을 발견했고,운영체제의 타이머와 동기화되어 정확한 시간을 보장할 수 있는 node-cron방식의 타이머를 도입함

## 포스터
![image](https://github.com/JUNGLE-RED-TEAM3/JungleCanvas/assets/129301830/620f84b4-a208-4e15-83b4-b64e18e101d5)


## 프로젝트 기간
2023.08.01 ~ 2023. 08. 11 (총 11일)

## 팀원소개
김상윤 : https://github.com/sangyoonk

김영우 : https://github.com/ywkim727

서경원 : https://github.com/ae-GYEONGWON

신준호 : https://github.com/huge-head-dino

장서영 : https://github.com/jangseoyoung98
