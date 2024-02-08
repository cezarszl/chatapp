import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Chat = ({ route, navigation }) => {
    const { name, background } = route.params;

    useEffect(() => {
        navigation.setOptions({ title: name });
      }, []);

    return (
        <View style={[styles.container, {backgroundColor: background}]}>
            <Text>Welcome to the chat</Text>
        </View>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   width: '100%',
   height: '100%',
 }
});

export default Chat;