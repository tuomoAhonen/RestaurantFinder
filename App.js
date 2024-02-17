import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import {Alert, Button, StyleSheet, Text, TextInput, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Constants from 'expo-constants';

export default function App() {
	const [address, setAddress] = useState('');
	const [location, setLocation] = useState(null);
	const [restaurants, setRestaurants] = useState(null);

	const initRegion = {
		longitude: 24.9427473,
		latitude: 60.1674881,
		latitudeDelta: 1,
		longitudeDelta: 1,
	};

	//https://geocode.maps.co/search?q=address&api_key=api_key

	const fetchLocation = async (e) => {
		e.preventDefault();
		if (!address) return;
		//console.log('fetch');
		try {
			const result = await fetch(
				`https://geocode.maps.co/search?q=${address}&api_key=${process.env.EXPO_PUBLIC_API_KEY}`
			);
			const json = await result.json();
			//console.log(json[0], json[0].lat, json[0].lon);
			return setLocation({latitude: parseFloat(json[0].lat), longitude: parseFloat(json[0].lon)});
		} catch (error) {
			console.log(error);
			return Alert.alert('Address not found', 'Please use correct address');
		}
	};

	/*`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=restaurant&location=${location.latitude}%2C${location.longitude}&radius=5000&type=restaurant&key=${process.env.EXPO_PUBLIC_GOOGLEAPI_KEY}`*/

	useEffect(() => {
		if (!location) return;

		(async () => {
			//tässä haetaan ravintolat location ympärillä?
			try {
				const result = await fetch(
					`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=restaurant&location=${location.latitude}%2C${location.longitude}&radius=5000&type=restaurant&key=${process.env.EXPO_PUBLIC_GOOGLEAPI_KEY}`
				);
				const {results} = await result.json();
				console.log(results[0]);
				return setRestaurants(results);
			} catch (error) {
				console.log(error);
				//oikeesti tän pitäisi mennä error-handleriin, joka antaisi oikean errorin ja virhesanoman sille?
				return Alert.alert(
					'Could not find any restaurants nearby',
					'There might be something wrong with service or connections. Try again with different address'
				);
			}
		})();
	}, [location]);

	//console.log(location);

	return (
		<View style={styles.container}>
			<MapView
				//initialRegion={initRegion}
				region={{
					latitude: location ? location.latitude : initRegion.latitude,
					longitude: location ? location.longitude : initRegion.longitude,
					latitudeDelta: location ? 0.125 : initRegion.latitudeDelta,
					longitudeDelta: location ? 0.125 : initRegion.longitudeDelta,
				}}
				style={styles.mapView}
			>
				{restaurants &&
					restaurants.length > 0 &&
					restaurants.map((restaurant, index) => {
						return (
							<Marker
								coordinate={{
									latitude: restaurant.geometry.location.lat,
									longitude: restaurant.geometry.location.lng,
								}}
								key={index}
								title={restaurant.name}
								description={restaurant.vicinity}
							/>
						);
					})}
			</MapView>
			<View style={styles.searchArea}>
				<TextInput
					placeholder='Address to find...'
					value={address}
					onChangeText={(e) => setAddress(e)}
					style={styles.addressInput}
				/>
				<Button title='Find address' onPress={(e) => fetchLocation(e)} />
			</View>
			<StatusBar style='auto' />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: Constants.statusBarHeight,
		display: 'flex',
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	mapView: {
		flex: 12,
		width: '100%',
	},
	searchArea: {
		flex: 2,
		width: '100%',
		paddingLeft: 10,
		paddingRight: 10,
		//alignItems: 'center',
		justifyContent: 'center',
	},
	addressInput: {
		//width: 300,
		margin: 0,
		marginBottom: 10,
		marginTop: 5,
		padding: 0,
		borderColor: '#000000',
		borderBottomWidth: 1,
	},
});

