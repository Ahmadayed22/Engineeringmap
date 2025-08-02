package com.engineeringmap.server.mapper;



import com.engineeringmap.server.dto.request.SignInRequest;
import com.engineeringmap.server.dto.response.UserResponse;
import com.engineeringmap.server.entity.User;
import com.engineeringmap.server.util.PasswordEncoderUtil;

public class UserMapper {

    public static User toEntity(SignInRequest signInRequest) {
        User user = new User();
        user.setUsername(signInRequest.username());
        user.setEmail(signInRequest.email());
        user.setPassword(PasswordEncoderUtil.encode(signInRequest.password()));
        return user;
    }

    public static UserResponse toResponseDto(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail()
          
        );
    }
    
} 

// onther approch using  MapStruct for mapping, you can uncomment the following code:

// @Mapper(componentModel = "spring")
// public interface UserMapper {

//     @Mapping(target = "password", expression = "java(com.engineeringmap.server.util.PasswordEncoderUtil.encode(signInRequest.password()))")
//     User toEntity(SignInRequest signInRequest);
// }