package com.valuelinku.cargoeye.api.repository;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;


@Mapper
@Repository
public interface GeofenceRepository {

        public List<Map<String, Object>> searchPortGeoList(Map<String, Object> map) throws Exception;

        public List<Map<String, Object>> searchLocGeoList(Map<String, Object> map) throws Exception; 

        public List<Map<String, Object>> searchRepPortList(Map<String, Object> map) throws Exception;
        
        public List<Map<String, Object>> searchDupLocGeoData(Map<String, Object> map) throws Exception;

        public void insertPortGeoData(Map<String, Object> map) throws Exception;

        public void updatePortGeoData(Map<String, Object> map) throws Exception;

        public int insertLocGeoData(Map<String, Object> map) throws Exception;

        public void updateLocGeoData(Map<String, Object> map) throws Exception;
        
        public int deleteLocGeoData(Map<String, Object> map) throws Exception;
        
        public void insertRepPortGeoData(Map<String, Object> map) throws Exception;
        
        //hanmin
        public int insertRepLocGeoData(Map<String, Object> map) throws Exception;

        public List<Map<String, Object>> searchRepLocGeoList(Map<String, Object> map) throws Exception; 

        //repFrm 검색조건
        public List<Map<String, Object>> searchPortCd(Map<String,Object> map) throws Exception;
        public List<Map<String, Object>> searchRepPortCd(Map<String,Object> map) throws Exception;

        public List<Map<String, Object>> searchRepPortGeoList(Map<String, Object> map) throws Exception;
        
}
