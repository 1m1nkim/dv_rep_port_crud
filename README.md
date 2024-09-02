# dv_rep_port_crud

프로젝트 제목 : DEEPVUEGEOFENCE_REP_PORT 페이지 개발 및 CRUD 처리
프로젝트 기간 : 2024년 08월 15일 ~ 2024년 08월 29일 (약 2주) 제출일 : 2024년 08월 29일

프로젝트 개요 : DEEPVUE GEOFENCE_PORT 페이지는 PORT관련 GEOFENCE를 등록, 관리, 확인 할 수 있는 페이지입니다. 이 페이지에서 파생 된 GEOFENCE_REP_PORT 페이지를 개발하여 REP의 특성을 가진 PORT들을 따로 구성하여 등록, 처리, 확인 할 수 있게 페이지를 만들게 되었습니다.

프로젝트 일정 : 
2024년 08월 15일 ~ 2024년 08월 22일: 코드 분석 및 간단한 테스트 코드 작성

2024년 08월 22일 ~ 2024년 08월 29일: 
같은 페이지 내 PORT 위젯들과의 연동성을 위한 REP_PORT 위젯들을 show, hide 방식으로 재배치 및 생성
PORT 기반으로 REP_PORT 등록 및 수정을 위한 mybatis 쿼리 및 model, service, controller 작성

사용된 도구 및 기술 : 프레임 워크 : Spring boot, Vue.js, TypeScript, ElementPlus,Java 데이터베이스 : MySQL, JPA, JQuery, MyBatis 버전 관리 : Git

시스템 아키텍처: MVC 패턴을 적용하여 코드의 모듈화를 극대화하고 유지보수를 용이하게 했습니다. 또한, RESTful API를 통해 데이터 통신을 효율적으로 처리하였으며, 이러한 아키텍처는 확장성과 유연성을 고려하여 설계되었습니다.

프로젝트 진행 중 직면한 문제 : 이전에 진행한 dv_admin 프로젝트에서 사용한 JPA, JQuery와는 다르게 Mybatis를 사용하여 쿼리문을 작성 한 점과 CRUD 즉 데이터의 삽입, 삭제를 진행하며 데이터의 중복 처리 즉 on duplicate key update에서 새로 쿼리문을 작성할 때 문제가 있었다. > 쿼리문을 한 칼럼씩 작성하며 어떤 구문에서 중복처리를 해야할지, null 값에 처리를 하면 애초에 값이 안들어간다던지 이런 점을 알게되었다.

프론트 작업 중 id 값과 ```setPortForm: function(data){ $("#iptPortCd").val(_get(data, 'PORT_CD'));}, $("#iptPort").method()``` 형식 같이 데이터베이스에서 id 값을 활용해 데이터를 가져오는 과정에서 iptPortCd 라 선언한 부분을 iptPort의 메소드로 불러오려던 탓에 데이터의 문제가 있었다. 변수명을 확실히 하여 헷갈리지 않게 코드를 꼼꼼하게 작성하는게 빠르게 개발하는 것 보다 중요하다는 것을 다시 한번 깨닫게 되었다.

프로젝트 결론 : 이전의 admin 프로젝트와는 다르게 데이터를 불러오는 것 뿐 아니라 crud 즉 데이터의 삽입, 삭제, 수정 등을 활용하여 백엔드 쪽 코드를 작성하는 법에 대해 더 깊이 알게 되었다.
또한 프론트 작업 중 디버깅 에러로 인한 오류를 겪고 앞으론 더욱 꼼꼼히 코드를 작성할 수 있을 것 같다.
