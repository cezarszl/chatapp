import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { useEffect } from "react";
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, id }) => {
    const actionSheet = useActionSheet();
    let recordingObject = null;

    useEffect(() => {
        return () => {
            recordingObject ? recordingObject.stopAndUnloadAsync() : null;
        }
    }, []);

    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Record Sound', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        actionSheet.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        pickImage();
                        return;
                    case 1:
                        takePhoto();
                        return;
                    case 2:
                        getLocation();
                        return;
                    case 3:
                        startRecording();
                        return;
                    default:
                }
            },
        );
    };

    // Get Location
    const getLocation = async () => {
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            const location = await Location.getCurrentPositionAsync({});
            if (location) {
                onSend({
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    },
                });
            } else Alert.alert("Error occurred while fetching location");
        } else Alert.alert("Permissions to accsess loaction haven't been granted.");
    }

    // Name uploaded image
    const generateReference = (uri) => {
        const timeStamp = (new Date()).getTime();
        const imageName = uri.split("/")[uri.split("/").length - 1];
        return `${id}-${timeStamp}-${imageName}`;
    }

    // Upload and send Image
    const uploadAndSendImage = async (imageURI) => {
        const uniqueRefString = generateReference(imageURI); 
        const newUploadRef = ref(storage, uniqueRefString);
        const response = await fetch(imageURI);
        const blob = await response.blob();
        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            const imageURL = await getDownloadURL(snapshot.ref);
            onSend({ image: imageURL});
        });
    }

    // Pick a Image
    const pickImage = async () => {
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);                
            else Alert.alert("Permissions to accsess photo library haven't been granted.");
        }
    }

    // Take a Photo
    const takePhoto = async () => {
        let permissions = await ImagePicker.requestCameraPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
            else Alert.alert("Permissions to use camera haven't been granted.")
        }
    }

    // Record Audio
    const startRecording = async () => {
        try {
            let permissions = await Audio.requestPermissionsAsync();
            if (permissions?.granted) {
                // iOS specific config to allow recording on iPhone devices
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });

                Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY).then (result => {
                    return result.recording;
                }).then(recording => {
                    recordingObject = recording;
                    Alert.alert("You are recording...", undefined, [
                        { text: 'Cancel', onPress: () => { stopRecording() } },
                        { text: 'Stop and Send', onPress: () => { sendRecordedSound() } },
                    ],
                    { cancelable: false }
                    );
                })
            }
        } catch (err) {
            Alert.alert("Failed to record!");
        }
    }

    const stopRecording = async () => {
        await Audio.setAudioModeAsync({
            // iOS specific config to stop recording on iPhone devices
            allowsRecordingIOS: false,
            playsInSilentModeIOS: false
        });
         await recordingObject.stopAndUnloadAsync();
    }

    const sendRecordedSound = async () => {
        await stopRecording();
        const uniqueRefString = generateReference(recordingObject.getURI());
        const newUploadRef = ref(storage, uniqueRefString);
        const response = await fetch(recordingObject.getURI());
        const blob = await response.blob();
        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            const soundURL = await getDownloadURL(snapshot.ref)
            onSend({ audio: soundURL})
        });
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onActionPress}>
            <View style={[styles.wrapper, wrapperStyle]}>
                <Text style={[styles.iconText, iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
      width: 26,
      height: 26,
      marginLeft: 10,
      marginBottom: 10,
    },
    wrapper: {
      borderRadius: 13,
      borderColor: '#b2b2b2',
      borderWidth: 2,
      flex: 1,
      justifyContent: 'center',
    },
    iconText: {
      color: '#b2b2b2',
      fontWeight: 'bold',
      fontSize: 20,
      backgroundColor: 'transparent',
      textAlign: 'center',
      top: -4
    },
});

export default CustomActions;