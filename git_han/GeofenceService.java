package com.valuelinku.cargoeye.api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.valuelinku.cargoeye.api.repository.GeofenceRepository;
import com.valuelinku.cargoeye.common.domain.OffsetBasedPageable;
import com.valuelinku.cargoeye.common.domain.ToastGrid;
import com.valuelinku.cargoeye.common.util.SecurityContextUtils;

@Service
public class GeofenceService {

    @Autowired 
    private GeofenceRepository geoRepo;

    @SuppressWarnings("unchecked")
    public JSONObject searchPortGeoList(Map<String, Object> args) throws Exception{
        Integer rowsPerPage = (Integer) args.get("ROWS_PER_PAGE");
        Integer pageNumber = (Integer) args.get("PAGE_NUMBER");
        Integer offset = (pageNumber - 1) * rowsPerPage;

        Pageable pageable = new OffsetBasedPageable(offset, rowsPerPage);

        int totalCount = 0;
        int iPageNumner = pageable.getPageNumber();
		int iStart = (iPageNumner * pageable.getPageSize());
        int iSize  = pageable.getPageSize();

        args.put("ROWS_PER_PAGE", iSize);
        args.put("PAGE_NUMBER", iStart);

        List<Map<String, Object>> list = geoRepo.searchPortGeoList(args);

        if( list.size() > 0 ){
            for(Map<String, Object> obj : list) {
        		totalCount = Integer.parseInt(String.valueOf(obj.get("TOTAL_COUNT")));
        		break;
        	}
        }

        ToastGrid tGrid = new ToastGrid();
        tGrid.setPageNumber( pageNumber );
        tGrid.setContents( list );
        tGrid.setTotalCount( totalCount );

        JSONObject result = new JSONObject();
        result.put("result", true);
        result.put("data", tGrid.getDataJson());

        return result;
    }

    @SuppressWarnings("unchecked")
    public JSONObject searchLocGeoList(Map<String, Object> args) throws Exception{
        List<Map<String, Object>> locGeoList = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> otherLocGeoList = new ArrayList<Map<String, Object>>();

        String areaKind = (String) args.get("AREA_KIND");
        String portType = (String) args.get("PORT_TYPE");
        Boolean isAll   = (Boolean) args.get("IS_ALL");
        
        if ( StringUtils.isNotBlank( (String) args.get("PORT_CD") ) ){
            if( StringUtils.isNotBlank(areaKind) ) {
                args.put("AREA_KIND", areaKind.substring(0,1));
            }
                
            if( StringUtils.isNotBlank(portType) ) {
                args.put("PORT_TYPE", portType.substring(0,1));
            }
            locGeoList = geoRepo.searchLocGeoList(args);

        } else if ( isAll ) {
            locGeoList = geoRepo.searchLocGeoList(args);
        }

        ToastGrid tGrid = new ToastGrid();
        tGrid.setPageNumber( (int) args.get("PAGE_NUMBER") );
        tGrid.setContents( locGeoList );

        JSONObject result = new JSONObject();
        result.put("result", true);
        result.put("data", tGrid.getDataJson());
        result.put("viewMode", otherLocGeoList);

        return result;
    }
    
    public List<Map<String, Object>> searchRepPortList(Map<String, Object> args) throws Exception{
        List<Map<String, Object>> list = geoRepo.searchRepPortList(args);

        return list;
    }

    @SuppressWarnings("unchecked")
    public JSONObject insertPortGeoData(Map<String, Object> args) throws Exception{
		args.put("USR_ID", SecurityContextUtils.getUsrId());

        geoRepo.insertPortGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg", "저장되었습니다.");
        result.put("status", "success");
        return result;
    }
    
    @SuppressWarnings("unchecked")
    public JSONObject updatePortGeoData(Map<String, Object> args) throws Exception{
        args.put("USR_ID", SecurityContextUtils.getUsrId());
        
        geoRepo.updatePortGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg", "저장되었습니다.");
        result.put("status", "success");
        return result;
    }
    //hanmin
    @SuppressWarnings("unchecked")
	public JSONObject insertLocGeoData(Map<String, Object> args) throws Exception{
        args.put("USR_ID", SecurityContextUtils.getUsrId());

        geoRepo.insertLocGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg"   , "저장되었습니다.");
        result.put("status", "success");
        return result;
    }
    //hanmin
    @SuppressWarnings("unchecked")
	public JSONObject insertRepLocGeoData(Map<String, Object> args) throws Exception{
        args.put("USR_ID", SecurityContextUtils.getUsrId());

        geoRepo.insertRepLocGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg"   , "저장되었습니다.");
        result.put("status", "success");
        return result;
    }
    
    @SuppressWarnings("unchecked")
	public JSONObject updateLocGeoData(Map<String, Object> args) throws Exception{
        args.put("USR_ID", SecurityContextUtils.getUsrId());

        geoRepo.updateLocGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg"   , "저장되었습니다.");
        result.put("status", "success");
        return result;
    }

    @SuppressWarnings("unchecked")
    public JSONObject copyLocGeoData(Map<String, Object> args) throws Exception{
        List<Map<String, Object>> list = geoRepo.searchDupLocGeoData(args);
        
        int successCnt = 0;
        String otherPortCd = (String) args.get("OTHER_PORT_CD");
        String portCd = (otherPortCd == null || otherPortCd.isEmpty()) ? (String) args.get("PORT_CD") : otherPortCd;

        for (Map<String, Object> obj : list) {
            obj.put("LOC_NAME", obj.get("LOC_NAME") + "-Copy");
            obj.put("USR_ID", SecurityContextUtils.getUsrId());
            obj.put("PORT_CD", portCd);
            successCnt += geoRepo.insertLocGeoData(obj);
        }

        JSONObject result = new JSONObject();
        result.put("msg"   , successCnt + " 건의 데이터가 복사되었습니다.");
        result.put("status", "success");
        return result;
    }

    @SuppressWarnings("unchecked")
    public JSONObject moveLocGeoData(Map<String, Object> args) throws Exception{
        List<Map<String, Object>> list = geoRepo.searchDupLocGeoData(args);
        
        int copyCnt = 0;
        String otherPortCd = (String) args.get("OTHER_PORT_CD");
        String portCd = (otherPortCd == null || otherPortCd.isEmpty()) ? (String) args.get("PORT_CD") : otherPortCd;

        for (Map<String, Object> obj : list) {
            obj.put("LOC_NAME", obj.get("LOC_NAME"));
            obj.put("USR_ID", SecurityContextUtils.getUsrId());
            obj.put("PORT_CD", portCd);
            copyCnt += geoRepo.insertLocGeoData(obj);
        }
        geoRepo.deleteLocGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg"   , copyCnt + " 건의 데이터가 이동되었습니다.");
        result.put("status", "success");
        return result;
    }

    @SuppressWarnings("unchecked")
    public JSONObject deleteLocGeoData(Map<String, Object> args) throws Exception{
        int successCnt = geoRepo.deleteLocGeoData(args);

        JSONObject result = new JSONObject();
        result.put("msg"   , successCnt + " 건의 데이터가 삭제되었습니다.");
        result.put("status", "success");
        return result;
    }

    //hanmin
    /** Rep. Port */    
    @SuppressWarnings("unchecked")
    public JSONObject insertRepPortGeoData(Map<String, Object> args) throws Exception {
        args.put("USR_ID", SecurityContextUtils.getUsrId());
        geoRepo.insertRepPortGeoData(args);
    
        JSONObject result = new JSONObject();
        result.put("msg", "저장되었습니다.");
        result.put("status", "success");
        return result;
    }

    //hanmin
    @SuppressWarnings("unchecked")
    public JSONObject searchRepLocGeoList(Map<String, Object> args) throws Exception{
        List<Map<String, Object>> locGeoList = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> otherLocGeoList = new ArrayList<Map<String, Object>>();

        String areaKind = (String) args.get("AREA_KIND");
        String portType = (String) args.get("PORT_TYPE");
        Boolean isAll   = (Boolean) args.get("IS_ALL");
        
        if ( StringUtils.isNotBlank( (String) args.get("PORT_CD") ) ){
            if( StringUtils.isNotBlank(areaKind) ) {
                args.put("AREA_KIND", areaKind.substring(0,1));
            }
                
            if( StringUtils.isNotBlank(portType) ) {
                args.put("PORT_TYPE", portType.substring(0,1));
            }
            locGeoList = geoRepo.searchLocGeoList(args);

        } else if ( isAll ) {
            locGeoList = geoRepo.searchLocGeoList(args);
        }

        ToastGrid tGrid = new ToastGrid();
        tGrid.setPageNumber( (int) args.get("PAGE_NUMBER") );
        tGrid.setContents( locGeoList );

        JSONObject result = new JSONObject();
        result.put("result", true);
        result.put("data", tGrid.getDataJson());
        result.put("viewMode", otherLocGeoList);

        return result;
    }
    //hanmin
    @SuppressWarnings("unchecked")
    public JSONObject searchRepPortGeoList(Map<String, Object> args) throws Exception {
        Integer rowsPerPage = (Integer) args.get("ROWS_PER_PAGE");
        Integer pageNumber = (Integer) args.get("PAGE_NUMBER");

        Integer offset = (pageNumber - 1) * rowsPerPage;

        Pageable pageable = new OffsetBasedPageable(offset, rowsPerPage);

        int totalCount = 0;
        int iPageNumner = pageable.getPageNumber();
        int iStart = (iPageNumner * pageable.getPageSize());
        int iSize  = pageable.getPageSize();

        args.put("ROWS_PER_PAGE", iSize);
        args.put("PAGE_NUMBER", iStart);

        List<Map<String, Object>> list = geoRepo.searchRepPortGeoList(args);

        if (list.size() > 0) {
            for (Map<String, Object> obj : list) {
                totalCount = Integer.parseInt(String.valueOf(obj.get("TOTAL_COUNT")));
                break; 
            }
        }

        ToastGrid tGrid = new ToastGrid();
        tGrid.setPageNumber(pageNumber);
        tGrid.setContents(list);
        tGrid.setTotalCount(totalCount);

        JSONObject result = new JSONObject();
        result.put("result", true);
        result.put("data", tGrid.getDataJson());

        return result;
    }
    //hanmin
    // repfrm save 시 port검색 
    public JSONObject searchPortCd(Map<String, Object> args) throws Exception {
        JSONObject result = new JSONObject();
        
        List<Map<String, Object>> portCdList = geoRepo.searchPortCd(args);
        
        if (portCdList != null && !portCdList.isEmpty()) {
            result.put("PORT_CD", portCdList);
            result.put("status", "success");
            result.put("msg", "Port code found successfully.");
        } else {
            result.put("status", "fail");
            result.put("msg", "No port code found.");
        }
        
        return result;
    }

    public JSONObject searchRepPortCd(Map<String, Object> args) throws Exception {
        JSONObject result = new JSONObject();
        
        List<Map<String, Object>> repPortCdList = geoRepo.searchRepPortCd(args);
        
        if (repPortCdList != null && !repPortCdList.isEmpty()) {
            result.put("REP_PORT", repPortCdList);
            result.put("status", "success");
            result.put("msg", "Port code found successfully.");
        } else {
            result.put("status", "fail");
            result.put("msg", "No port code found.");
        }
        
        return result;
    }
}
