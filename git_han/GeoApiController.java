package com.valuelinku.cargoeye.api.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.valuelinku.cargoeye.api.service.GeofenceService;
import com.valuelinku.cargoeye.common.util.RequestUtil;
import com.valuelinku.cargoeye.common.util.SecurityContextUtils;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/api/json/", produces = "application/json")
public class GeoApiController {
    @Autowired
    private GeofenceService apiSvc;

    private final Logger log = LoggerFactory.getLogger(getClass());

    @RequestMapping(value = "searchPortGeoList", method = { RequestMethod.GET })
    public JSONObject searchPortGeoList(
            @RequestParam(value = "PORT_CD", required = false, defaultValue = "") String portCd,
            @RequestParam(value = "REP_PORT_CD", required = false) String repPortCd,
            @RequestParam(value = "UN_LOC_CD", required = false) String unLocCd,
            @RequestParam(value = "TS_PORT", required = false) String tsPort,
            @RequestParam(value = "PORT_TYPE", required = false, defaultValue = "") String portType,
            @RequestParam(value = "perPage", required = false, defaultValue = "10") Integer rowsPerPage,
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(value = "SEL_PORT_CD", required = false, defaultValue = "") String selPortCd)
            throws Exception {

        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("UN_LOC_CD", unLocCd);
        param.put("TS_PORT", tsPort);
        param.put("REP_PORT_CD", repPortCd);
        param.put("PORT_TYPE", portType);
        param.put("ROWS_PER_PAGE", rowsPerPage);
        param.put("PAGE_NUMBER", pageNumber);
        param.put("SEL_PORT_CD", selPortCd);
        
        return apiSvc.searchPortGeoList(param);
    }

    @RequestMapping(value = "searchLocGeoList", method = { RequestMethod.GET })
    public JSONObject getLocGeoList(@RequestParam(value = "PORT_CD", required = false, defaultValue = "") String portCd,
            @RequestParam(value = "LOC_NAME", required = false, defaultValue = "") String locName,
            @RequestParam(value = "AREA_KIND", required = false, defaultValue = "") String areaKind,
            @RequestParam(value = "PORT_TYPE", required = false, defaultValue = "") String portType,
            @RequestParam(value = "ROWS_PER_PAGE", required = false, defaultValue = "9999") Integer rowsPerPage,
            @RequestParam(value = "PAGE_NUMBER", required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(value = "IS_ALL", required = false, defaultValue = "false") Boolean isAll) throws Exception {

        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("LOC_NAME", locName);
        param.put("AREA_KIND", areaKind);
        param.put("PORT_TYPE", portType);
        param.put("ROWS_PER_PAGE", rowsPerPage);
        param.put("PAGE_NUMBER", pageNumber);
        param.put("IS_ALL", isAll);

        return apiSvc.searchLocGeoList(param);
    }

    @RequestMapping(value = "searchRepLocGeoList", method = { RequestMethod.GET })
    public JSONObject getRepLocGeoList(@RequestParam(value = "REP_PORT_CD", required = false, defaultValue = "") String portCd,
            @RequestParam(value = "LOC_NAME", required = false, defaultValue = "") String locName,
            @RequestParam(value = "AREA_KIND", required = false, defaultValue = "") String areaKind,
            @RequestParam(value = "PORT_TYPE", required = false, defaultValue = "") String portType,
            @RequestParam(value = "ROWS_PER_PAGE", required = false, defaultValue = "9999") Integer rowsPerPage,
            @RequestParam(value = "PAGE_NUMBER", required = false, defaultValue = "1") Integer pageNumber,
            @RequestParam(value = "IS_ALL", required = false, defaultValue = "false") Boolean isAll) throws Exception {

        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("REP_PORT_CD", portCd);
        param.put("LOC_NAME", locName);
        param.put("AREA_KIND", areaKind);
        param.put("PORT_TYPE", portType);
        param.put("ROWS_PER_PAGE", rowsPerPage);
        param.put("PAGE_NUMBER", pageNumber);
        param.put("IS_ALL", isAll);

        return apiSvc.searchLocGeoList(param);
    }


    @RequestMapping(value = "searchRepPortList", method = { RequestMethod.POST })
    public List<Map<String, Object>> searchRepPortList(
            @RequestParam(value = "rep_port", required = false, defaultValue = "") String repPort) throws Exception {
        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("REP_PORT_CD", repPort);
        return apiSvc.searchRepPortList(param);
    }
    
    @RequestMapping(value="insertPortGeoData", method={ RequestMethod.POST })
	public JSONObject insertPortGeoData(@RequestParam(value = "PORT_CD") String portCd,
                                        @RequestParam(value = "PORT_NM") String portNm,
                                        @RequestParam(value = "UN_LOC_CD") String unLocCd,
                                        @RequestParam(value = "TS_PORT") String tsPort,
                                        @RequestParam(value = "PORT_GEO") String portGeo,
                                        @RequestParam(value = "REP_PORT_CD") String repPortCd,
                                        @RequestParam(value = "PORT_TYPE") String portType,
                                        @RequestParam(value = "LOC_LAT", required = false) Double lat,
                                        @RequestParam(value = "LOC_LON", required = false) Double lon) throws Exception {
                         
        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("UN_LOC_CD", unLocCd);
        param.put("TS_PORT", tsPort);
        param.put("PORT_NM", portNm);
        param.put("PORT_GEO", portGeo);
        param.put("REP_PORT_CD", repPortCd);
        param.put("PORT_TYPE", portType);
        param.put("LOC_LAT", lat);
        param.put("LOC_LON", lon);

		return apiSvc.insertPortGeoData(param);
	}

    @RequestMapping(value="updatePortGeoData", method={ RequestMethod.POST })
	public JSONObject updatePortGeo(@RequestParam(value = "PORT_CD") String portCd,
                                    @RequestParam(value = "PORT_NM") String portNm,
                                    @RequestParam(value = "UN_LOC_CD") String unLocCd,
                                    @RequestParam(value = "PORT_GEO") String portGeo,
                                    @RequestParam(value = "REP_PORT_CD") String repPortCd,
                                    @RequestParam(value = "PORT_TYPE") String portType,
                                    @RequestParam(value = "LOC_LAT", required = false) Double lat,
                                    @RequestParam(value = "LOC_LON", required = false) Double lon) throws Exception {
                         
        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("UN_LOC_CD", unLocCd);
        param.put("PORT_NM", portNm);
        param.put("PORT_GEO", portGeo);
        param.put("REP_PORT_CD", repPortCd);
        param.put("PORT_TYPE", portType);
        param.put("LOC_LAT", lat);
        param.put("LOC_LON", lon);

		return apiSvc.updatePortGeoData(param);
	}

    @RequestMapping(value="insertLocGeoData", method={ RequestMethod.POST })
	public JSONObject insertLocGeoData(@RequestParam(value = "PORT_CD") String portCd,
                                       @RequestParam(value = "LOC_NAME") String locNm,
                                       @RequestParam(value = "PORT_TYPE") String portType,
                                       @RequestParam(value = "AREA_KIND") String areaKind,
                                       @RequestParam(value = "DATA_TYPE") String dataType,
                                       @RequestParam(value = "LOC_GEO") String locGeo,
                                       @RequestParam(value = "DEFAULT_YN") String defaultYn,
                                       @RequestParam(value = "LOC_LAT", required = false) Double lat,
                                       @RequestParam(value = "LOC_LON", required = false) Double lon,
                                       @RequestParam(value = "DWT_LMT", required = false) Double dwt,
                                       @RequestParam(value = "DRAFT_LMT", required = false) Double draft,
                                       @RequestParam(value = "RAD_SIZE", defaultValue = "0") Double radius) throws Exception {
                         
        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("PORT_TYPE", portType);
        param.put("LOC_NAME", locNm);
        param.put("AREA_KIND", areaKind);
        param.put("DATA_TYPE", dataType);
        param.put("DEFAULT_YN", defaultYn);
        param.put("LOC_GEO", locGeo);
        param.put("LOC_LAT", lat);
        param.put("LOC_LON", lon);
        param.put("DWT_LMT", dwt);
        param.put("DRAFT_LMT", draft);
        param.put("RAD_SIZE", radius);
        
		return apiSvc.insertLocGeoData(param);
	}

    @RequestMapping(value="insertRepLocGeoData", method={ RequestMethod.POST })
    public JSONObject insertRepLocGeoData(@RequestParam(value = "REP_PORT_CD") String repPortCd,
                                        @RequestParam(value = "LOC_NAME") String locNm,
                                        @RequestParam(value = "PORT_TYPE") String portType,
                                        @RequestParam(value = "AREA_KIND") String areaKind,
                                        @RequestParam(value = "DATA_TYPE") String dataType,
                                        @RequestParam(value = "LOC_GEO") String locGeo,
                                        @RequestParam(value = "DEFAULT_YN") String defaultYn,
                                        @RequestParam(value = "LOC_LAT", required = false) Double lat,
                                        @RequestParam(value = "LOC_LON", required = false) Double lon,
                                        @RequestParam(value = "DWT_LMT", required = false) Double dwt,
                                        @RequestParam(value = "DRAFT_LMT", required = false) Double draft,
                                        @RequestParam(value = "RAD_SIZE", defaultValue = "0") Double radius) throws Exception {

        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("REP_PORT_CD", repPortCd);
        param.put("PORT_TYPE", portType);
        param.put("LOC_NAME", locNm);
        param.put("AREA_KIND", areaKind);
        param.put("DATA_TYPE", dataType);
        param.put("DEFAULT_YN", defaultYn);
        param.put("LOC_GEO", locGeo);
        param.put("LOC_LAT", lat);
        param.put("LOC_LON", lon);
        param.put("DWT_LMT", dwt);
        param.put("DRAFT_LMT", draft);
        param.put("RAD_SIZE", radius);

        return apiSvc.insertRepLocGeoData(param);
    }

    @RequestMapping(value="updateLocGeoData", method={ RequestMethod.POST })
	public JSONObject updateLocGeoData(@RequestParam(value = "PORT_CD") String portCd,
                                       @RequestParam(value = "LOC_NAME") String locNm,
                                       @RequestParam(value = "PORT_TYPE") String portType,
                                       @RequestParam(value = "AREA_KIND") String areaKind,
                                       @RequestParam(value = "DATA_TYPE") String dataType,
                                       @RequestParam(value = "LOC_GEO") String locGeo,
                                       @RequestParam(value = "DEFAULT_YN") String defaultYn,
                                       @RequestParam(value = "LOC_LAT", required = false) Double lat,
                                       @RequestParam(value = "LOC_LON", required = false) Double lon,
                                       @RequestParam(value = "DWT_LMT", required = false) Double dwt,
                                       @RequestParam(value = "DRAFT_LMT", required = false) Double draft,
                                       @RequestParam(value = "LOC_CD") Long locCd,
                                       @RequestParam(value = "RAD_SIZE", defaultValue = "0") Double radius) throws Exception {
                         
        String crrCd = SecurityContextUtils.getUser().getCrrCd();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("PORT_TYPE", portType);
        param.put("LOC_NAME", locNm);
        param.put("AREA_KIND", areaKind);
        param.put("DATA_TYPE", dataType);
        param.put("DEFAULT_YN", defaultYn);
        param.put("LOC_GEO", locGeo);
        param.put("LOC_LAT", lat);
        param.put("LOC_LON", lon);
        param.put("DWT_LMT", dwt);
        param.put("DRAFT_LMT", draft);
        param.put("LOC_CD", locCd);
        param.put("RAD_SIZE", radius);

		return apiSvc.updateLocGeoData(param);
	}

    @RequestMapping(value="copyLocGeoData", method={ RequestMethod.POST })
    public JSONObject copyLocGeoData(@RequestBody Map<String, Object> requestData,
                                    HttpServletRequest request) throws Exception {
                         
        log.info("user_no: {}, ip: {}, action: {}, parameter: {}", SecurityContextUtils.getUsrNo(), RequestUtil.getClientIP(request), "[Geofence] Copy LocGeo", requestData);
        
        String crrCd = SecurityContextUtils.getUser().getCrrCd();
        String portCd = (String) requestData.get("PORT_CD");
        String otherPortCd = (String) requestData.get("OTHER_PORT_CD");
        List<Map<String, String>> locCdPortTypeList = (List<Map<String, String>>) requestData.get("locCdPortTypeList");
        
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("OTHER_PORT_CD", otherPortCd);
        param.put("locCdPortTypeList", locCdPortTypeList);
        
		return apiSvc.copyLocGeoData(param);
	}

    @RequestMapping(value="moveLocGeoData", method={ RequestMethod.POST })
    public JSONObject moveLocGeoData(@RequestBody Map<String, Object> requestData,
                                    HttpServletRequest request) throws Exception {
                         
        log.info("user_no: {}, ip: {}, action: {}, parameter: {}", SecurityContextUtils.getUsrNo(), RequestUtil.getClientIP(request), "[Geofence] Move LocGeo", requestData);
        
        String crrCd = SecurityContextUtils.getUser().getCrrCd();
        String portCd = (String) requestData.get("PORT_CD");
        String otherPortCd = (String) requestData.get("OTHER_PORT_CD");
        List<Map<String, String>> locCdPortTypeList = (List<Map<String, String>>) requestData.get("locCdPortTypeList");
        
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("OTHER_PORT_CD", otherPortCd);
        param.put("locCdPortTypeList", locCdPortTypeList);
        
		return apiSvc.moveLocGeoData(param);
	}

    @RequestMapping(value="deleteLocGeoData", method={ RequestMethod.POST })
    public JSONObject deleteLocGeoData(@RequestBody Map<String, Object> requestData,
                                    HttpServletRequest request) throws Exception {
                         
        log.info("user_no: {}, ip: {}, action: {}, parameter: {}", SecurityContextUtils.getUsrNo(), RequestUtil.getClientIP(request), "[Geofence] Delete LocGeo", requestData);
        
        String crrCd = SecurityContextUtils.getUser().getCrrCd();
        String portCd = (String) requestData.get("PORT_CD");
        List<Map<String, String>> locCdPortTypeList = (List<Map<String, String>>) requestData.get("locCdPortTypeList");
        
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("PORT_CD", portCd);
        param.put("locCdPortTypeList", locCdPortTypeList);
        
		return apiSvc.deleteLocGeoData(param);
	}

    @RequestMapping(value="insertRepPortGeoData", method={ RequestMethod.POST })
    public JSONObject insertRepPortData(@RequestParam(value = "REP_PORT", required = false) String reqRepPort,
                                        @RequestParam(value = "PORT_GEO", required = false) String portGeo,
                                        @RequestParam(value = "LOC_LAT", required = false) Double lat,
                                        @RequestParam(value = "LOC_LON", required = false) Double lon,
                                        @RequestParam(value = "CRE_USR_ID", required = false) String creUsrId,
                                        @RequestParam(value = "CRE_DT", required = false) String creDt,
                                        @RequestParam(value = "UPD_USR_ID", required = false) String updUsrId,
                                        @RequestParam(value = "UPD_DT", required = false) String updDt,
                                        @RequestParam(value = "REG_USR_NO", required = false) String regUsrNo,
                                        @RequestParam(value = "REG_DT", required = false) String regDt,
                                        @RequestParam(value = "UPD_USR_NO", required = false) String updUsrNo
                                        ) throws Exception {

        String crrCd = SecurityContextUtils.getUser().getCrrCd();
        String repPort = reqRepPort != null ? reqRepPort : SecurityContextUtils.getUsrId();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("CRR_CD", crrCd);
        param.put("REP_PORT", repPort);
        param.put("PORT_GEO", portGeo);
        param.put("LOC_LAT", lat);
        param.put("LOC_LON", lon);
        param.put("CRE_USR_ID",creUsrId);
        param.put("CRE_DT", creDt);
        param.put("UPD_USR_ID", updUsrId);
        param.put("UPD_DT", updDt);
        param.put("REG_USR_NO", regUsrNo);
        param.put("REG_DT", regDt);
        param.put("UPD_USR_NO", updUsrNo);


        return apiSvc.insertRepPortGeoData(param);
    }

   



    @RequestMapping(value = "searchRepPortGeoList", method = { RequestMethod.GET })
    public JSONObject searchRepPortGeoList(
            @RequestParam(value = "CRR_CD", required = false) String crrCd,
            @RequestParam(value = "REP_PORT", required = false) String repPort,
            @RequestParam(value = "UN_LOC_CD", required = false) String unLocCd,
            @RequestParam(value = "PORT_TYPE", required = false) String portType,
            @RequestParam(value = "perPage", required = false, defaultValue = "9999") Integer rowsPerPage,
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer pageNumber) throws Exception {

        if (crrCd == null || crrCd.isEmpty()) {
            crrCd = SecurityContextUtils.getUser().getCrrCd();
        }

        Map<String, Object> param = new HashMap<>();
        param.put("CRR_CD", crrCd);
        param.put("REP_PORT", repPort);
        param.put("UN_LOC_CD", unLocCd);
        param.put("PORT_TYPE", portType);
        param.put("ROWS_PER_PAGE", rowsPerPage);
        param.put("PAGE_NUMBER", pageNumber);

        JSONObject result = apiSvc.searchRepPortGeoList(param);
        return result;
    }

    // hanmin
    @RequestMapping(value = "searchPortCd", method = { RequestMethod.GET })
    public JSONObject searchPortCd(@RequestParam(value = "PORT_CD") String portCd) throws Exception {
        Map<String, Object> param = new HashMap<>();
        param.put("PORT_CD", portCd);
        JSONObject result = apiSvc.searchPortCd(param);
        return result;
    }

    @RequestMapping(value = "searchRepPortCd", method = { RequestMethod.GET })
    public JSONObject searchRepPortCd(@RequestParam(value = "REP_PORT") String repPort) throws Exception {
        Map<String, Object> param = new HashMap<>();
        param.put("REP_PORT", repPort);
        JSONObject result = apiSvc.searchRepPortCd(param);
        return result;
    }
}
