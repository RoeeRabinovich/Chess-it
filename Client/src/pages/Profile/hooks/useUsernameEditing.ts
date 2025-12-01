import { useState, useEffect, useCallback } from "react";
import { User } from "../../../types/user";
import { apiService } from "../../../services/api";
import { useAppDispatch } from "../../../store/hooks";
import { login as loginAction } from "../../../store/authSlice";
import Joi from "joi";

const usernameSchema = Joi.string().min(3).max(30).required().messages({
  "string.empty": "Username is required.",
  "string.min": "Username must be at least 3 characters.",
  "string.max": "Username must be at most 30 characters.",
});

interface UseUsernameEditingParams {
  user: User | null;
  onUserUpdate: (updatedUser: User) => void;
}

interface UseUsernameEditingReturn {
  isEditingUsername: boolean;
  usernameValue: string;
  usernameError: string | null;
  showConfirmModal: boolean;
  isSubmitting: boolean;
  handleEditUsername: () => void;
  handleCancelEdit: () => void;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenConfirmModal: () => void;
  handleConfirmUsernameChange: () => Promise<void>;
  closeConfirmModal: () => void;
}

export const useUsernameEditing = ({
  user,
  onUserUpdate,
}: UseUsernameEditingParams): UseUsernameEditingReturn => {
  const dispatch = useAppDispatch();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUsernameValue(user.username);
    }
  }, [user]);

  const validateUsername = useCallback(
    (value: string): string | null => {
      const { error } = usernameSchema.validate(value);
      if (error) {
        return error.details[0].message;
      }
      if (value === user?.username) {
        return "Username is the same as current";
      }
      return null;
    },
    [user],
  );

  const handleEditUsername = useCallback(() => {
    if (user) {
      setUsernameValue(user.username);
      setIsEditingUsername(true);
      setUsernameError(null);
    }
  }, [user]);

  const handleCancelEdit = useCallback(() => {
    if (user) {
      setUsernameValue(user.username);
      setIsEditingUsername(false);
      setUsernameError(null);
    }
  }, [user]);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUsernameValue(value);
      if (value !== user?.username) {
        const error = validateUsername(value);
        setUsernameError(error);
      } else {
        setUsernameError(null);
      }
    },
    [user, validateUsername],
  );

  const handleOpenConfirmModal = useCallback(() => {
    const error = validateUsername(usernameValue);
    if (error) {
      setUsernameError(error);
      return;
    }
    setShowConfirmModal(true);
  }, [usernameValue, validateUsername]);

  const handleConfirmUsernameChange = useCallback(async () => {
    if (!user || !usernameValue) return;

    setIsSubmitting(true);
    try {
      const updatedUser = await apiService.updateUsername(usernameValue);
      onUserUpdate(updatedUser);
      setIsEditingUsername(false);
      setShowConfirmModal(false);
      setUsernameError(null);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(loginAction(updatedUser));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update username";
      setUsernameError(errorMessage);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, usernameValue, onUserUpdate, dispatch]);

  const closeConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return {
    isEditingUsername,
    usernameValue,
    usernameError,
    showConfirmModal,
    isSubmitting,
    handleEditUsername,
    handleCancelEdit,
    handleUsernameChange,
    handleOpenConfirmModal,
    handleConfirmUsernameChange,
    closeConfirmModal,
  };
};

