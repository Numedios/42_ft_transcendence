import {
	SetStateAction,
	Dispatch,
	useContext
} from "react"
import { useNavigate } from "react-router"
import Cookies from "js-cookie"

import {
	Style,
	ProfileWrapper,
	ButtonsWrapper,
	ProfileName,
	Avatar,
} from "./style"

import Icon from "../../componentsLibrary/Icon"

import AuthContext from "../../contexts/AuthContext"

import { User, UserAuthenticate } from "../../utils/types"

import deconnexionIcon from "../../assets/deconnexion.png"
import settingsIcon from "../../assets/settings.png"
import axios from "axios"

type PropsProfile = {
	userAuthenticate: UserAuthenticate,
	card: boolean,
	displayCard: Dispatch<SetStateAction<boolean>>,
	userTarget: User | UserAuthenticate,
	setUserTarget: Dispatch<SetStateAction<User | UserAuthenticate>>,
	setCardPosition: Dispatch<SetStateAction<{
		left?: number,
		right?: number,
		top?: number,
		bottom?: number
	}>>,
	settings: boolean,
	displaySettingsMenu: Dispatch<SetStateAction<boolean>>
}

function Profile({ userAuthenticate, card, displayCard, userTarget, setUserTarget, setCardPosition, settings, displaySettingsMenu }: PropsProfile) {

	const { token, setToken, url } = useContext(AuthContext)!
	const navigate = useNavigate()

	function showCard() {
		if (card && userTarget === userAuthenticate)
			displayCard(false)
		else {
			setUserTarget(userAuthenticate)
			setCardPosition({ right: 0, top: 0 })
			displayCard(true)
		}
	}

	async function handleDeconnexionClickButton() {

		try {

			await axios.get(`http://${url}:3333/auth/logout`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			}) 
			
			Cookies.remove('access_token')

			localStorage.removeItem('token')
			localStorage.clear();
			setToken('')
			navigate("/")
		}
		catch (error) {
			console.log(error)
		}

	}

	return (
		<Style>
			<ProfileWrapper onClick={showCard}>
				<Avatar src={userAuthenticate.avatar} />
				<ProfileName>
					{userAuthenticate.username}
				</ProfileName>
			</ProfileWrapper>
			<ButtonsWrapper>
				<Icon
					onClick={() => displaySettingsMenu(!settings)}
					src={settingsIcon} size={38}
					alt="Settings button" title="Settings" />
				<Icon
					onClick={handleDeconnexionClickButton}
					src={deconnexionIcon} size={38}
					alt="Deconnexion button" title="Deconnexion" />
			</ButtonsWrapper>
		</Style>
	)
}

export default Profile